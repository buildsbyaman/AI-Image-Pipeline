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

---

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

---

## Jobs Management

### 1. Create a Job
*   **Endpoint:** `/api/v1/jobs`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** `{ fileKey }`
*   **Behavior:** Creates a Job in MongoDB and adds a task to the `image-captioning` queue.

### 2. Get All Jobs
*   **Endpoint:** `/api/v1/jobs`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** Returns a list of all jobs belonging to the authenticated user along with their processing results.

### 3. Get Single Job
*   **Endpoint:** `/api/v1/jobs/:id`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** Returns detailed status and results for the specified job.

### 4. Retry a Job
*   **Endpoint:** `/api/v1/jobs/:id/retry`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <token>`
*   **Behavior:** Deletes old results, resets job status to `PENDING`, and re-adds to the `image-captioning` queue.

### 5. Delete a Job
*   **Endpoint:** `/api/v1/jobs/:id`
*   **Method:** `DELETE`
*   **Headers:** `Authorization: Bearer <token>`
*   **Behavior:** Deletes the job, results, and associated R2 storage file.

---

## Real-Time Notifications (Socket.IO)

*   **Endpoint:** `ws://localhost:8000`
*   **Auth Handshake:** `{ auth: { token: "..." } }`
*   **Events Received by Client:** `notification:new` (Fired in real-time when a stage completes, succeeds, or fails).
