import Redis from "ioredis";
import { env } from "../../config";
import { sseService } from "./sse.service";
import { socketService, RedisNotificationEvent, NotificationPayload } from "./socket.service";
import { logger } from "../../shared/logger";

class RedisSubscriber {
  private subscriber: Redis | null = null;

  public init() {
    this.subscriber = new Redis({
      host: env.REDIS_HOST || "localhost",
      port: (env.REDIS_PORT as number) || 6379,
    });

    this.subscriber.on("connect", () => {
      logger.info("✅ Redis Subscriber connected to Pub/Sub");
    });

    this.subscriber.on("error", (error) => {
      logger.error(error, "❌ Redis Subscriber connection error");
    });

    const channel = "notification.created";
    
    this.subscriber.subscribe(channel, (err, count) => {
      if (err) {
        logger.error(err, `❌ Failed to subscribe to channel: ${channel}`);
        return;
      }
      logger.info(`✅ Subscribed to ${count} channel(s). Listening on: ${channel}`);
    });

    this.subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          const parsedMessage = JSON.parse(message) as RedisNotificationEvent;

          if (parsedMessage.event === "notification.created" && parsedMessage.userId) {
            const payload: NotificationPayload = {
              notificationId: parsedMessage.notificationId,
              title: parsedMessage.title,
              message: parsedMessage.message,
              createdAt: new Date().toISOString(),
              jobId: parsedMessage.jobId
            };

            sseService.emitNotification(parsedMessage.userId, payload);
            socketService.emitNotification(parsedMessage.userId, payload);
          }
        } catch (error) {
          logger.error(error as Error, "❌ Failed to process Redis message");
        }
      }
    });
  }
}

export const redisSubscriber = new RedisSubscriber();
