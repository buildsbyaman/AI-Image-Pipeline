# AI Processing Worker Microservice

This is a standalone, database-free microservice responsible for processing multi-stage image pipelines asynchronously using BullMQ and **OpenAI's GPT-4o-mini Vision API**.

---

## Architecture & Coordination

Instead of running a single monolithic job, the AI pipeline is split into three decoupled queue workers that process jobs sequentially using the OpenAI API:

1. **`safety-check` queue**:
   - Consumed by **`SafetyCheckWorker`**.
   - Downloads the image buffer from Cloudflare R2 and writes it to a local temporary cache file (`/tmp/pipeline-job-{jobId}.tmp`).
   - **Stage 1: Content Safety Moderation**: Evaluates the image using the OpenAI Vision API.
   - If the image is **safe**, publishes `W1_COMPLETED` and enqueues to the `image-captioning` queue.
   - If the image is **flagged**, publishes `CONTENT_FLAGGED`, enqueues a warning email directly to the notification system, and performs cleanup (bypassing stages 2 & 3).
2. **`image-captioning` queue**:
   - Consumed by **`ImageCaptioningWorker`**.
   - Reads the image buffer from the local cache file (falls back to R2 download on miss).
   - **Stage 2: Image Captioning**: Generates a descriptive caption via OpenAI.
   - Publishes `W2_COMPLETED` and enqueues to the `label-detection` queue.
3. **`label-detection` queue**:
   - Consumed by **`LabelDetectionWorker`**.
   - Reads the cached image buffer.
   - **Stage 3: Label Detection**: Requests relevant objects and labels via OpenAI.
   - Publishes `IMAGE_PROCESSED_SUCCESS`, enqueues the success email notification, and performs final cleanup of the temporary cache file.


## Cache Protection & Memory Safeguards

To prevent cache directory growth or disk space leaks:

- **Exhausted Retries Handler**: If any stage fails permanently after exhausting all retries, the worker automatically intercepts the failure and cleans up the temporary cache file.
- **Hourly Cache Sweeper**: A periodic sweeper runs every hour in the background, automatically cleaning up any abandoned `pipeline-job-*.tmp` cache files older than 15 minutes.

---

## Tech Stack

- **Core**: Node.js & TypeScript
- **Task Orchestration**: BullMQ & Redis
- **Storage Integration**: AWS SDK v3 (Cloudflare R2)
- **AI Engine**: OpenAI API (`gpt-4o-mini`)

---

## API Keys

This service requires the following API keys to function:

### OpenAI API Key
1. Sign in to the [OpenAI Platform](https://platform.openai.com/).
2. Navigate to the API keys section.
3. Click "Create new secret key".
4. Copy the key and use it as `OPENAI_API_KEY`.

### Cloudflare R2 Credentials
1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to R2 Object Storage.
3. Create a bucket to get your `R2_BUCKET_NAME`.
4. Click on "Manage R2 API Tokens" and create a new token.
5. Copy the Account ID (`R2_ACCOUNT_ID`), Access Key ID (`R2_ACCESS_KEY_ID`), and Secret Access Key (`R2_SECRET_ACCESS_KEY`).

---

## API Documentation

For details about the BullMQ queue architecture, payload formats, and events, refer to the [API Documentation](api.md).
