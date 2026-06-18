# Database Schemas Documentation

This directory contains the Mongoose schemas and models defining the data structure for the AI Image Pipeline platform.

---

## 1. User Model (`User`)
Stores registered user profiles and authentication tokens.

| Field Name | Type | Validation / Options | Description |
| :--- | :--- | :--- | :--- |
| `email` | `String` | Required, Unique | User's email address (login credential) |
| `passwordHash` | `String` | Required | Bcrypt hashed password |
| `firstName` | `String` | Required | User's first name |
| `lastName` | `String` | Required | User's last name |
| `refreshTokenHash` | `String` | Optional | SHA-256 hash of active Refresh Token |
| `createdAt` | `Date` | Generated | Document creation timestamp |
| `updatedAt` | `Date` | Generated | Document last update timestamp |

---

## 2. File Model (`File`)
Maintains metadata records of uploaded images stored in Cloudflare R2 object storage.

| Field Name | Type | Validation / Options | Description |
| :--- | :--- | :--- | :--- |
| `key` | `String` | Required, Unique | Unique object storage key (UUID-based name) |
| `url` | `String` | Required | Publicly accessible URL of the file |
| `originalName` | `String` | Required | Client-side filename of the uploaded image |
| `mimeType` | `String` | Required | MIME Type (e.g. `image/jpeg`, `image/png`) |
| `size` | `Number` | Required | File size in bytes |
| `userId` | `ObjectId` | Ref: `User` (Optional) | The user who uploaded the file |
| `createdAt` | `Date` | Generated | Upload timestamp |
| `updatedAt` | `Date` | Generated | Last metadata modification timestamp |

---

## 3. Job Model (`Job`)
Tracks status, progress, and errors of AI processing pipeline tasks.

| Field Name | Type | Validation / Options | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `ObjectId` | Ref: `User`, Required | Owner of the processing job |
| `fileKey` | `String` | Required | Key of the target file to be processed |
| `status` | `String` | Enum: `JobStatus`, Default: `PENDING` | Pipeline completion state |
| `error` | `String` | Optional | Error message description if the job fails |

**`JobStatus` Enum Values:**
* `PENDING`: Job is created and queued.
* `PROCESSING`: Job is picked up by a worker.
* `W1`: Stage 1 (Image Captioning) completed.
* `W2`: Stage 2 (Label Detection) completed.
* `COMPLETED`: Whole pipeline (including content moderation) successfully completed.
* `FAILED`: Pipeline failed at any stage.

---

## 4. Result Model (`Result`)
Contains generated AI model predictions from OpenAI (captions, labels, and safety moderation status).

| Field Name | Type | Validation / Options | Description |
| :--- | :--- | :--- | :--- |
| `jobId` | `ObjectId` | Ref: `Job`, Required, Unique | Associated processing job |
| `caption` | `String` | Optional | AI generated image caption description |
| `labels` | `[String]` | Default: `[]` | Array of labels/objects detected in the image |
| `flagged` | `Boolean` | Default: `false` | True if safety checks flag the image |
| `flaggedCategory`| `String` | Optional | Category name responsible for safety flag |

---

## 5. Notification Model (`Notification`)
Logs notification dispatches and delivery states.

| Field Name | Type | Validation / Options | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `String` | Required | Target user recipient ID |
| `email` | `String` | Required | Recipient email address |
| `type` | `String` | Required | Event notification trigger type |
| `subject` | `String` | Required | Email subject line |
| `message` | `String` | Required | Body context details |
| `status` | `String` | Enum: `NotificationStatus`, Default: `PENDING` | Current state of delivery |
| `provider` | `String` | Default: `'resend'` | Third-party messaging provider API used |
| `error` | `String` | Optional | Error logs if email delivery fails |
| `read` | `Boolean` | Default: `false` | Notification read status |
| `jobId` | `ObjectId` | Ref: `Job` (Optional) | Associated job identifier |

**`NotificationStatus` Enum Values:**
* `PENDING`: Notification created and ready for queueing.
* `SENT`: Delivery confirmed by Resend API.
* `FAILED`: Delivery attempt encountered errors.
