# Notification Service API Documentation

Base URL: `http://localhost:5005`

All endpoints generally return a standardized JSON response format:

```json
{
  "success": true | false,
  "message": "Description of the operation outcome",
  "data": {}, // Optional: Returned on success
  "errors": [] // Optional: Returned on failure (e.g. Zod validation errors)
}
```

---

## 1. Queue Email Notification
Queues an email notification for a user.

*   **Endpoint:** `/api/v1/notifications/email`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "userId": "uuid-string-here",
      "email": "user@example.com"
    }
    ```
    *Note: `userId` must be a valid UUID and `email` must be a valid email format.*

*   **Response (202 Accepted):**
    ```json
    {
      "success": true,
      "message": "Notification queued"
    }
    ```

---

## 2. Get All Notifications
Fetches a paginated list of notifications.

*   **Endpoint:** `/api/v1/notifications`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `page` (optional): Page number (default: 1)
    *   `limit` (optional): Number of items per page (default: 10)

*   **Response (200 OK):**
    ```json
    {
      "data": [
        {
          "id": "uuid-string-here",
          "userId": "uuid-string-here",
          "recipient": "user@example.com",
          "status": "DELIVERED",
          "createdAt": "2026-06-17T05:00:00.000Z",
          "updatedAt": "2026-06-17T05:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "totalPages": 5
      }
    }
    ```
    *Note: This specific endpoint returns `data` and `pagination` directly at the root object level without the `success` wrapper.*

---

## 3. Get Notification by ID
Fetches details of a specific notification by its ID.

*   **Endpoint:** `/api/v1/notifications/:id`
*   **Method:** `GET`

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid-string-here",
        "userId": "uuid-string-here",
        "recipient": "user@example.com",
        "status": "DELIVERED",
        "createdAt": "2026-06-17T05:00:00.000Z",
        "updatedAt": "2026-06-17T05:00:00.000Z"
      }
    }
    ```

---

## 4. Retry Notification
Re-queues a failed or pending notification for delivery.

*   **Endpoint:** `/api/v1/notifications/:id/retry`
*   **Method:** `PATCH`

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Notification requeued for delivery"
    }
    ```

---

## Common Error Codes

| Status Code | Reason / Example |
| :--- | :--- |
| **400 Bad Request** | Missing fields or Zod validation failures (e.g., invalid UUID or email format). |
| **404 Not Found** | The specified notification ID does not exist. |
| **500 Internal Error** | Unhandled system exception or database connection failure. |
