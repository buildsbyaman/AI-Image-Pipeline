# Email System API & Queue Documentation

The Email System is a background worker service powered by **BullMQ**, **Redis**, and the **Resend API**. It consumes email job payloads asynchronously from a centralized queue.

---

## 1. Queue Configuration

*   **Queue Name:** `email-queue`
*   **Job Name:** `send-pipeline-email`
*   **Concurrency:** `5` parallel jobs per worker instance

---

## 2. Job Payload Schema

Jobs added to `email-queue` must match the `EmailJobPayload` interface:

```typescript
export interface EmailJobPayload {
  to: string;                         // Recipient email address
  userName: string;                   // User's name for template personalization
  type: 'IMAGE_PROCESSED_SUCCESS' | 'CONTENT_FLAGGED'; // Email type
  jobId: string;                      // Media processing job ID
  category?: string;                  // Flagged category (required if type is CONTENT_FLAGGED)
}
```

### Example: Image Processed Successfully
```json
{
  "name": "send-pipeline-email",
  "data": {
    "to": "user@example.com",
    "userName": "Jane",
    "type": "IMAGE_PROCESSED_SUCCESS",
    "jobId": "job-uuid-12345"
  }
}
```

### Example: Content Flagged Warning
```json
{
  "name": "send-pipeline-email",
  "data": {
    "to": "user@example.com",
    "userName": "Jane",
    "type": "CONTENT_FLAGGED",
    "jobId": "job-uuid-12345",
    "category": "nsfw"
  }
}
```

---

## 3. Email Templates

The service renders dynamic HTML and plain text email templates using a lightweight local engine located in `src/features/email/templates/`.

| Job Type | Template Name | Description |
| :--- | :--- | :--- |
| `IMAGE_PROCESSED_SUCCESS` | `processed` | Notification that AI image processing succeeded. |
| `CONTENT_FLAGGED` | `flagged` | Safety warning indicating image was flagged for moderation. |