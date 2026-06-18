# Authentication API Documentation

Base URL: `http://localhost:8000`

All endpoints return a standardized JSON response format:
```json
{
  "success": true | false,
  "message": "Description of the operation outcome",
  "data": {}, // Optional: Returned on success
  "errors": [] // Optional: Returned on failure (validation details, error arrays, etc.)
}
```

---

## 1. Sign Up
Creates a new user account.

*   **Endpoint:** `/api/auth/signup`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!",
      "firstName": "John",
      "lastName": "Doe"
    }
    ```
    *Note: Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.*

*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Account created successfully",
      "data": {
        "user": {
          "id": "uuid-string-here",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      }
    }
    ```
*   **Set-Cookie Header:**
    *   `refreshToken`: HTTP-only, secure (production only), SameSite=Strict cookie containing the refresh token.

---

## 2. Login
Authenticates an existing user and returns tokens.

*   **Endpoint:** `/api/auth/login`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!"
    }
    ```

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "uuid-string-here",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      }
    }
    ```
*   **Set-Cookie Header:**
    *   `refreshToken`: HTTP-only, secure (production only), SameSite=Strict cookie containing the refresh token.

---

## 3. Logout
Invalidates the current session by clearing the refresh token from both the database and the cookies.

*   **Endpoint:** `/api/auth/logout`
*   **Method:** `POST`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```
*   **Set-Cookie Header:**
    *   `refreshToken`: Clears cookie immediately.

---

## 4. Refresh Token
Generates a new access token and refresh token (refresh token rotation).

*   **Endpoint:** `/api/auth/refresh`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:** (Optional if using Cookie-based auth, otherwise required)
    ```json
    {
      "refreshToken": "eyJhbGciOi..."
    }
    ```
    *Note: The endpoint will check for `refreshToken` in the request body first, and fallback to the `refreshToken` Cookie if the body is not provided.*

*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Token refreshed successfully",
      "data": {
        "accessToken": "new-access-token-string",
        "refreshToken": "new-refresh-token-string"
      }
    }
    ```
*   **Set-Cookie Header:**
    *   Updates `refreshToken` cookie with the new rotated token.

---

## 5. Get Current User
Fetches authenticated user information.

*   **Endpoint:** `/api/auth/me`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <accessToken>`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "User fetched successfully",
      "data": {
        "id": "uuid-string-here",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
    ```

---

## Common Error Codes

| Status Code | Reason / Example |
| :--- | :--- |
| **400 Bad Request** | Missing fields, Zod validation failures, password requirements not met. |
| **401 Unauthorized** | Missing token, expired signature, or invalid token. |
| **409 Conflict** | Attempting to sign up with an email that is already registered. |
| **500 Internal Error** | Unhandled system exception or database connection failure. |
