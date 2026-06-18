import { Queue } from "bullmq";
import { connection } from "../../shared/queue";

// Type definitions representing all possible execution milestone events sent back to the Express Server
export interface SuccessNotificationPayload {
  type: "IMAGE_PROCESSED_SUCCESS";
  userId: string;
  jobId: string;
  caption: string;
  labels: string[];
}

export interface FlaggedNotificationPayload {
  type: "CONTENT_FLAGGED";
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

// Handles dispatching progress status and result notifications to the Express Server
// This ensures the worker doesn't need database access, keeping database operations centralized in the Express backend.
export class NotificationPublisher {
  private queue: Queue;

  constructor() {
    // Express Server runs a worker on this queue to update MongoDB and broadcast WebSockets
    this.queue = new Queue("pipeline-events", { connection: connection as any });
  }

  // Adds a progress/status payload into the pipeline events queue with automatic retry setups
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
