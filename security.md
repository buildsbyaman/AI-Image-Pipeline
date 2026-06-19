# Security

This document outlines the security measures implemented across all services of the AI Image Pipeline — the Express Server, Worker System, Email System, and React Frontend.

---

## Authentication & Authorization

### JWT-Based Authentication
- Access tokens are signed with a 128-character cryptographically random secret (`JWT_ACCESS_SECRET`) generated via `crypto.randomBytes(64)`.
- Refresh tokens use a separate 128-character secret (`JWT_REFRESH_SECRET`) so that access and refresh signing keys are fully independent.
- Access tokens expire in **15 minutes**; refresh tokens expire in **7 days**.
- Token verification is performed on every protected request via the `authenticate` middleware, which also re-fetches the user from the database to ensure the account still exists.

### Refresh Token Rotation & Storage
- Refresh tokens are stored server-side as a **SHA-256 hash** (`refreshTokenHash`) in MongoDB — the raw token is never persisted.
- On every refresh, a new token pair is issued and the old hash is replaced (single-use rotation).
- The refresh token is delivered exclusively via an **`httpOnly`, `Secure`, `SameSite`** cookie and is never included in JSON response bodies, preventing JavaScript access and XSS theft.
- The frontend stores only the short-lived access token (in memory via `localStorage`), never the refresh token.

### Route-Level Authorization
- All protected HTTP routes require the `authenticate` middleware, which only reads the `Authorization: Bearer <token>` header — never a query string.
- File serving (`GET /api/files/:key`) requires authentication and verifies that the requesting user **owns** the file. Requests from non-owners receive `403 Forbidden`.
- Job routes are scoped to the authenticated user — `findOne({ _id: id, userId })` is used throughout to prevent IDOR (Insecure Direct Object Reference) attacks.
- The SSE stream (`GET /api/notifications/stream`) uses a dedicated `sseAuthenticate` middleware that supports `?token=` as a fallback only for this endpoint, since the native browser `EventSource` API cannot set custom headers. All other endpoints strictly reject query-string tokens.

### Socket.IO Authentication
- Every WebSocket connection is gated by a JWT middleware (`socketAuthMiddleware`) that runs before the connection is accepted.
- Connections without a valid access token are rejected immediately with an `"Unauthorized"` error.

---

## Password Security

- Passwords are hashed using **bcrypt** with a cost factor of `10` before storage. The raw password is never persisted.
- Signup enforces a minimum password complexity policy: at least 8 characters, containing uppercase, lowercase, a number, and a special character.
- Login error messages are intentionally generic ("Invalid email or password") to prevent user enumeration.

---

## Rate Limiting

- A **global rate limiter** (1,000 requests / 15 minutes per IP) is applied to the entire Express API.
- A **dedicated, stricter rate limiter** (10 requests / 15 minutes per IP) is applied exclusively to the authentication endpoints: `POST /auth/login`, `POST /auth/signup`, and `POST /auth/refresh`.
  - `skipSuccessfulRequests: true` ensures legitimate users don't exhaust the limit through normal usage — only failed attempts count.
- Standard `RateLimit-*` headers are returned to clients; legacy `X-RateLimit-*` headers are disabled.

---

## File Upload Security

### Two-Phase Ownership Model
- When a presigned upload URL is requested (`POST /api/files/presign`), a `pending` File record is **atomically created in MongoDB tied to the requesting user's ID** before the URL is returned.
- At confirmation time (`POST /api/files/confirm`), the server looks up the pending record by `{ key, userId, status: "pending" }`. If no matching record exists for that user, the request is rejected — preventing any other user from claiming an uploaded file.
- File records are promoted from `pending` → `confirmed` only after the client confirms the upload, ensuring jobs cannot be started against files that were never actually uploaded.

### File Type Restrictions
- Only `image/jpeg`, `image/png`, and `image/webp` MIME types are accepted at both the presign and confirm stages, validated via Zod schemas.
- File size is capped at **5 MB** at the API level (validated before a presigned URL is issued).

### Presigned URL Expiry
- Cloudflare R2 presigned upload URLs expire after **15 minutes** (`expiresIn: 900`).

---

## Input Validation

- All incoming request bodies are validated with **Zod schemas** before any business logic executes, across all three backend services.
- Validation errors are caught by the global error handler and returned as structured `400 Bad Request` responses — no raw stack traces are exposed to clients.
- Environment variables are validated at startup in every service using Zod schemas; invalid or missing configuration causes an immediate process exit rather than a silent misconfiguration.

---

## HTTP Security Headers

- **Helmet.js** is applied globally to set secure HTTP headers including:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection`
  - `Strict-Transport-Security` (in production)
  - `Content-Security-Policy` (Helmet defaults)

---

## Infrastructure Security

### MongoDB
- MongoDB is started with `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` set in Docker Compose.
- All service connection strings include credentials and target the `admin` authentication source: `mongodb://user:pass@mongo:27017/db?authSource=admin`.

### Redis
- Redis is started with `--requirepass` in Docker Compose.
- All services pass `REDIS_PASSWORD` to their `ioredis` and BullMQ connections.
- The `REDIS_PASSWORD` environment variable is optional in local development (no password required when running outside Docker).

---

## Secrets Management

- Secrets (JWT keys, cloud credentials, API keys) are stored in `.env` files which are listed in `.gitignore` and are never committed to version control.
- JWT secrets are 128-character cryptographically random hex strings generated with `crypto.randomBytes(64)`.
- The same JWT secret pair is shared between the Express Server and Worker System so tokens minted by one service can be verified by the other.

---

## Queue & Inter-Service Communication

- All inter-service communication between the Worker System and the Express Server flows through **BullMQ queues over Redis** — there is no direct HTTP between these services.
- Workers are configured with up to **3 automatic retries** with exponential back-off for transient failures.
- The Worker System does not have direct database access; it publishes events to the `pipeline-events` queue, and the Express Server's internal worker applies all database mutations. This keeps database write logic centralised and auditable.

---

## Error Handling & Information Disclosure

- A global error handler intercepts all uncaught errors and returns sanitised responses — internal stack traces, file paths, and raw exception messages are never forwarded to API clients.
- Custom error classes (`BadRequestError`, `UnauthorizedError`, `NotFoundError`, `ConflictError`) produce predictable, structured JSON error responses.
- Template engine errors in the Email System log the full filesystem path internally (for debugging) but throw a sanitised message that contains no path information.
- Morgan HTTP logging uses `"dev"` format in development and `"combined"` format in production.

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please open a private GitHub issue or contact the maintainer directly. Do not disclose vulnerabilities publicly until they have been reviewed and addressed.
