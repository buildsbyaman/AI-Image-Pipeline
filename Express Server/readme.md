# Express Server

This is the main REST API Backend & Socket.IO Gateway for the AI Image Pipeline.

## Architecture & Responsibilities

This Express backend serves as the core orchestrator for the application:

- **Authentication**: JWT-based auth with Access/Refresh token rotation and secure HTTP-only cookies.
- **File Uploads**: Generates secure Cloudflare R2 presigned URLs, enabling clients to bypass the server for heavy file uploads.
- **Job Coordination**: Creates background jobs in MongoDB and initiates the decoupled AI pipeline via BullMQ and Redis.
- **Rate Limiting**: Enforces global IP-based rate limiting as well as granular user-based rate limiting (100 req / 15 mins) on all authenticated endpoints.
- **Real-Time Gateway**: Maintains authenticated Socket.IO connections to stream live updates of job progress back to frontend clients.

For detailed API routes and WebSocket events, refer to the [API Documentation](api.md).

## API Keys

This service requires the following API keys to function:

### Cloudflare R2 Credentials

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to R2 Object Storage.
3. Create a bucket to get your `R2_BUCKET_NAME`.
4. Click on "Manage R2 API Tokens" and create a new token.
5. Copy the Account ID (`R2_ACCOUNT_ID`), Access Key ID (`R2_ACCESS_KEY_ID`), and Secret Access Key (`R2_SECRET_ACCESS_KEY`).
