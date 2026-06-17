import { Queue } from "bullmq";
import { connection } from "../../queues/connection";

export interface SuccessNotificationPayload {
  type: "IMAGE_PROCESSED_SUCCESS";
  userId: string;
  jobId: string;
}

export interface FlaggedNotificationPayload {
  type: "ADULT_CONTENT_FLAGGED";
  userId: string;
  jobId: string;
  category: string;
}

type NotificationPayload = SuccessNotificationPayload | FlaggedNotificationPayload;

export class NotificationPublisher {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("notifications", { connection: connection as any });
  }

  async publish(payload: NotificationPayload) {
    await this.queue.add("send-notification", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }
}
