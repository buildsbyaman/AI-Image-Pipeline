# Frontend API Integration Documentation

The React Frontend acts as a client to the main Express Server and real-time Socket.IO gateway. It does not expose its own API but rather consumes upstream services.

## API Integration Points

### 1. HTTP Client
- **Base URL:** Defined via `VITE_API_URL` (e.g., `http://localhost:8000/api/v1`)
- **Responsibilities:** Communicates with the Express API to handle user authentication, file uploads to Cloudflare R2, and job management.

### 2. Socket.IO Client
- **URL:** Defined via `VITE_SOCKET_URL`
- **Responsibilities:** Connects to the Express Server gateway to receive real-time updates (`notification:new`) about background AI job progress.
