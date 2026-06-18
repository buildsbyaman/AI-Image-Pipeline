# AI Processing Worker Queue & Event API Documentation

The AI Processing Worker is a background processing microservice that processes images asynchronously. Since it does not expose an HTTP REST interface, this document defines the asynchronous message-passing interface (queues), payload formats, state transitions, and downstream events.

## Queue Context

*   **Redis Connection Host:** Shared Redis instance configured via environment variables.
*   **Database Engine:** Database-free (all database updates are handled by the Express Server based on events).
*   **Task/Queue Processor:** BullMQ (Node.js/TypeScript queue library).

---

## 1. Multi-Stage Pipeline Queues

Instead of a single queue, the AI pipeline splits execution across three sequential queues:

### Stage W1: `image-captioning`
*   **Queue Name:** `image-captioning`
*   **Payload Format (JSON):**
    ```json
    {
      "jobId": "db-job-id-here",
      "userId": "db-user-id-here",
      "fileKey": "r2-storage-file-key-here",
      "email": "user-email-here",
      "firstName": "user-first-name-here"
    }
    ```
*   **Worker:** `ImageCaptioningWorker` downloads the file from Cloudflare R2, writes it to local disk cache (`/tmp/pipeline-job-{jobId}.tmp`), performs image captioning via Hugging Face, publishes `W1_COMPLETED` progress notice to `pipeline-events` queue, and enqueues to `label-detection`.

### Stage W2: `label-detection`
*   **Queue Name:** `label-detection`
*   **Payload Format (JSON):**
    ```json
    {
      "jobId": "db-job-id-here",
      "userId": "db-user-id-here",
      "fileKey": "r2-storage-file-key-here",
      "email": "user-email-here",
      "firstName": "user-first-name-here",
      "caption": "A description of the image content"
    }
    ```
*   **Worker:** `LabelDetectionWorker` reads the cached image from disk (falls back to R2 download if missing), performs label detection via Google Cloud Vision API, publishes `W2_COMPLETED` progress notice to `pipeline-events` queue, and enqueues to `safety-check`.

### Stage W3: `safety-check`
*   **Queue Name:** `safety-check`
*   **Payload Format (JSON):**
    ```json
    {
      "jobId": "db-job-id-here",
      "userId": "db-user-id-here",
      "fileKey": "r2-storage-file-key-here",
      "email": "user-email-here",
      "firstName": "user-first-name-here",
      "caption": "A description of the image content",
      "labels": ["Tag1", "Tag2", "Tag3"]
    }
    ```
*   **Worker:** `SafetyCheckWorker` reads the cached image from disk, performs SafeSearch detection via Google Cloud Vision API, publishes the final milestone event (`IMAGE_PROCESSED_SUCCESS` or `CONTENT_FLAGGED`) to `pipeline-events` queue, enqueues email data to `email-queue`, and **deletes the temporary cache file** to free disk space.

---

## 2. Downstream Events (Dispatched to Express Server)

The worker system pushes events to the **`pipeline-events`** queue, which is consumed by the Express Server backend:

| Event Type | Sent By | Payload | Description |
| :--- | :--- | :--- | :--- |
| **`W1_COMPLETED`** | Stage W1 | `{ type, jobId, userId, caption }` | Sent after image caption is generated. |
| **`W2_COMPLETED`** | Stage W2 | `{ type, jobId, userId, labels }` | Sent after visual labels are generated. |
| **`IMAGE_PROCESSED_SUCCESS`** | Stage W3 | `{ type, jobId, userId, caption, labels }` | Sent when safety check passes. |
| **`CONTENT_FLAGGED`** | Stage W3 | `{ type, jobId, userId, category, caption, labels }` | Sent when safety check flags the content. |
| **`FAILED`** | Any Stage | `{ type, jobId, userId, error }` | Sent on unhandled worker failures. |

---

## 3. Email Notification Handoff (`email-queue`)

In Stage W3, if user details are present, the worker enqueues a task to the `email-queue` consumed by the dedicated Email System:
*   **Queue Name:** `email-queue`
*   **Payload Format:**
    ```json
    {
      "to": "user-email-here",
      "userName": "user-first-name-here",
      "type": "IMAGE_PROCESSED_SUCCESS" | "CONTENT_FLAGGED",
      "jobId": "db-job-id-here",
      "category": "flagged-category-here"
    }
    ```

---

## Error Handling & Disk Resiliency

*   **Exhausted Retries Handler**: If Stage 1 or Stage 2 fails permanently, a fail hook runs that cleans up `/tmp/pipeline-job-{jobId}.tmp` to prevent disk leaks.
*   **Hourly Sweeper Daemon**: An automated hourly sweeper deletes any temporary cached files older than 15 minutes to guarantee that disk cache memory never fills up.
*   **Resilient Cache Fallback**: If a worker runs on a separate machine (cache miss), it will automatically fall back to downloading the file from Cloudflare R2 privately, assuring execution completeness.
