import Redis from "ioredis";
import { env } from "../config/env";
import { socketService } from "../socket/socket.service";
import { RedisNotificationEvent, NotificationPayload } from "../types/socket.types";
import { logger } from "../utils/logger";

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
      logger.error("❌ Redis Subscriber connection error", error);
    });

    // Subscribe to notification channel
    const channel = "notification.created";
    
    this.subscriber.subscribe(channel, (err, count) => {
      if (err) {
        logger.error(`❌ Failed to subscribe to channel: ${channel}`, err);
        return;
      }
      logger.info(`✅ Subscribed to ${count} channel(s). Listening on: ${channel}`);
    });

    // Handle messages
    this.subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          const parsedMessage = JSON.parse(message) as RedisNotificationEvent;

          if (parsedMessage.event === "notification.created" && parsedMessage.userId) {
            const payload: NotificationPayload = {
              notificationId: parsedMessage.notificationId,
              title: parsedMessage.title,
              message: parsedMessage.message,
              createdAt: new Date().toISOString()
            };

            // Delegate to socket service to push to frontend
            socketService.emitNotification(parsedMessage.userId, payload);
          }
        } catch (error) {
          logger.error("❌ Failed to process Redis message", error);
        }
      }
    });
  }
}

export const redisSubscriber = new RedisSubscriber();
