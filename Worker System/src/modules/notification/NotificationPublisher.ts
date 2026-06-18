import { Queue } from "bullmq";
import { connection } from "../../shared/queue";

export interface SuccessNotificationPayload {
  type: "IMAGE_PROCESSED_SUCCESS";
  userId: string;
  jobId: string;
  caption: string;
  labels: string[];
}

export interface FlaggedNotificationPayload {
  type: "ADULT_CONTENT_FLAGGED";
  userId: string;
  jobId: string;
  category: string;
  caption: string;
  labels: string[];
}

export interface W1CompletedNotificationPayload {
  type: "W1_COMPLETED";
  userId: string;
  jobId: string;
  caption: string;
}

export interface W2CompletedNotificationPayload {
  type: "W2_COMPLETED";
  userId: string;
  jobId: string;
  labels: string[];
}

export interface FailedNotificationPayload {
  type: "FAILED";
  userId: string;
  jobId: string;
  error: string;
}

type NotificationPayload =
  | SuccessNotificationPayload
  | FlaggedNotificationPayload
  | W1CompletedNotificationPayload
  | W2CompletedNotificationPayload
  | FailedNotificationPayload;

export class NotificationPublisher {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("pipeline-events", { connection: connection as any });
  }

  async publish(payload: NotificationPayload) {
    await this.queue.add("pipeline-event", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }
}
