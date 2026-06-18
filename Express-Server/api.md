# Main Server API Documentation

Base URL: `http://localhost:8000`

## Authentication

### 1. User Signup
*   **Endpoint:** `/api/v1/auth/signup`
*   **Method:** `POST`
*   **Body:** `{ email, password, firstName, lastName }`

### 2. User Login
*   **Endpoint:** `/api/v1/auth/login`
*   **Method:** `POST`
*   **Body:** `{ email, password }`
*   **Response:** Sets HTTP-only `refreshToken` cookie and returns `accessToken`.

### 3. Get Current User
*   **Endpoint:** `/api/v1/auth/me`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <token>`

## File Upload (Cloudflare R2)

### 1. Generate Presigned URL
*   **Endpoint:** `/api/v1/files/presign`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** `{ originalName, mimeType, size }`
*   **Response:** Returns a temporary AWS S3 presigned upload URL and the `key`.

### 2. Confirm Upload
*   **Endpoint:** `/api/v1/files/confirm`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** `{ key }`
*   **Behavior:** Verifies the file in R2, creates a `File` record, and initiates the `Job` pipeline via BullMQ.

## Real-Time Notifications (Socket.IO)

*   **Endpoint:** `ws://localhost:8000`
*   **Auth Handshake:** `{ auth: { token: "..." } }`
*   **Events Received by Client:** `notification:new` (Fired when a background AI job succeeds or fails).
