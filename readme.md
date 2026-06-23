# AI Image Pipeline

An industry-grade, AI-powered media processing application featuring a decoupled microservices architecture.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

---

This project combines a modern React frontend, a robust Express backend with real-time Socket.IO notifications, an asynchronous three-stage AI Processing Worker (powered entirely by OpenAI), and a dedicated Email Notification system. 

It supports enterprise-grade patterns including JWT-based authentication, MongoDB data modeling, secure direct-to-cloud file uploads via Cloudflare R2, and reliable background job orchestration using BullMQ.

---

## Key Features

*   **Decoupled AI Processing Pipeline**: A three-stage sequential background worker architecture utilizing **OpenAI (`gpt-4o-mini`)** for Content Safety Moderation (W1), Image Captioning (W2), and Label Detection (W3). If an image is flagged, subsequent AI stages are bypassed immediately to save API cost.
*   **Real-Time Notification Gateway**: Socket.IO integration pushes status updates directly to authenticated clients in real-time as background jobs progress.
*   **Granular Rate Limiting**: Features global IP-based rate limits combined with user-based rate limiting (100 req / 15 mins) on all authenticated endpoints to prevent API abuse.

*   **Database-Free Microservices**: Both the AI Worker and Email System operate independently of the main database, coordinating exclusively via Redis queues (BullMQ) and events (`pipeline-events`).
*   **Cloudflare R2 Integration**: Direct-to-R2 presigned file uploads securely transfer massive payloads without bottlenecking the backend server. A Cloudflare Worker validates the file payload just before the write to R2, ensuring the upload only succeeds if it passes the same validation rules implemented on the frontend.
*   **Robust Email System**: Standalone asynchronous email notification microservice built on BullMQ, Redis, and Resend with custom HTML templating.
*   **Advanced Security & Authentication**: Production-ready JWT auth featuring Access/Refresh token rotation, secure HTTP-only cookies, password hashing (bcrypt), and Socket.IO handshake validation.
*   **Memory & Storage Optimization**: Intelligent local caching (`/tmp` writes) in the worker system prevents redundant object storage downloads, managed by automated garbage-collection sweepers.

---

## Architecture & Project Structure

The project is divided into four main independent services. For a detailed technical deep-dive into the system design, data flow, and architectural decisions, see the [AI Image Processing Pipeline — Design Document](AI%20Image%20Processing%20Pipeline.pdf).

### System Architecture

![System Architecture](Architecture.png)

### Directory Layout

```text
├── Express Server/          # Main REST API Backend & Socket.IO Gateway
│   ├── src/
│   │   ├── config.ts        # Environment configurations
│   │   ├── database/        # Mongoose schemas & connections
│   │   ├── features/        # Domain-driven feature modules (auth, jobs)
│   │   ├── shared/          # Middlewares, logging, global errors
│   │   └── index.ts         # Server entrypoint
│   └── api.md               # API endpoint documentation
│
├── Worker System/           # Standalone AI Processing Worker Microservice
│   ├── src/
│   │   ├── config/          # Zod-validated environment config
│   │   ├── modules/         # Sequential Pipeline Stages (W1, W2, W3)
│   │   └── worker.ts        # Worker orchestrator and cache sweeper
│   └── readme.md            # Worker architecture documentation
│
├── Email System/            # Standalone Notification Microservice
│   ├── src/
│   │   ├── features/        # Resend integrations & BullMQ processors
│   │   └── templates/       # Dynamic HTML/Text email templates
│   └── readme.md            # Notification system documentation
│
└── Frontend/                # React Vite SPA
│   ├── src/
│   │   ├── components/      # UI components (Tailwind)
│   │   ├── pages/           # Application views
│   │   └── lib/             # API client configurations
│
├── File Validation Worker.js  # Cloudflare Worker source — deployed to intercept R2 uploads
```

### Real-Time Notification Flow

The Main Backend hosts Socket.IO alongside its REST endpoints. When microservices (like the Worker or Email systems) publish updates to Redis, the Gateway forwards these events in real-time to authenticated clients.

```mermaid
graph TD
    A[Frontend Client] -- "1. Socket Connection (JWT)" --> B(Express Socket.IO Gateway)
    C[Redis Pub/Sub] -- "3. Publish 'notification.created'" --> B
    D[Notification Microservice] -- "2. Produce Event" --> C
    B -- "4. Emit 'notification:new'" --> A
```

**Connection Requirements**

*   **Authentication**: A valid JWT must be passed in the connection handshake.
*   **Private Rooms**: Authenticated connections join a private room (`user:<userId>`) to ensure secure message routing.

---

## Tech Stack

### Frontend
*   **Core**: React 19, TypeScript
*   **Build & Bundle**: Vite
*   **Styling**: Tailwind CSS, Framer Motion (Animations)
*   **Forms & Validation**: React Hook Form, Zod
*   **Icons**: Lucide React

### API Gateway (Express Backend)
*   **Core**: Node.js, Express.js, TypeScript, Socket.IO
*   **Database & ORM**: MongoDB, Mongoose
*   **Queueing & Events**: Redis Pub/Sub (`ioredis`)
*   **Storage**: Cloudflare R2 (S3-compatible) via AWS SDK v3
*   **Security**: JWT, bcryptjs, Helmet, CORS, express-rate-limit
*   **Observability**: Winston, Morgan

### AI Processing Worker
*   **Core**: Node.js, TypeScript
*   **Task Orchestration**: BullMQ & Redis
*   **AI Engine**: OpenAI API (`gpt-4o-mini`)
*   **Architecture**: Database-free, stateless, hybrid local caching

### Notification Service (Email Worker)
*   **Core**: Node.js, TypeScript, Express.js
*   **Task Orchestration**: BullMQ & Redis
*   **Provider**: Resend SDK
*   **Architecture**: Database-free, custom HTML template engine

---

## Security Posture

*   **Token Storage**: Refresh tokens are isolated in HTTP-only, secure cookies. Short-lived access tokens reside in memory.
*   **Socket Handshake Verification**: Socket.IO connections actively reject connections lacking a valid, signed JWT access token.
*   **Direct Upload Security**: Clients must request cryptographically signed URLs (time-limited) to interact with Cloudflare R2, ensuring malicious payloads bypass backend servers entirely.
*   **Cloudflare Worker Validation**: Enforces server-side type and integrity validation rules via a Cloudflare Worker positioned immediately before R2 writes, mirroring frontend constraints for a secure upload pipeline.
*   **Error Sanitization**: Global error handlers scrub stack traces before responses reach clients in production.

---

## Service Documentation

For detailed information about each microservice, please refer to their respective README documentation:

*   [Express Server Documentation](file:///Users/aman/Desktop/Projects/AI%20Image%20Pipeline/Express%20Server/readme.md)
*   [Worker System Documentation](file:///Users/aman/Desktop/Projects/AI%20Image%20Pipeline/Worker%20System/readme.md)
*   [Email System Documentation](file:///Users/aman/Desktop/Projects/AI%20Image%20Pipeline/Email%20System/readme.md)
*   [Frontend Documentation](file:///Users/aman/Desktop/Projects/AI%20Image%20Pipeline/Frontend/readme.md)

---

## Cloudflare Worker

`File Validation Worker.js` is a **production Cloudflare Worker** deployed in front of Cloudflare R2. It intercepts every presigned PUT upload and validates it before the object is written to storage — enforcing the same rules as the frontend as a server-side guarantee.

**Validation performed on every upload:**

| Check | Detail |
|-------|--------|
| MIME type | Only `image/jpeg`, `image/png`, `image/webp` are accepted |
| File size | Rejected if `Content-Length` or actual body exceeds **5 MB** |
| Magic bytes | First bytes of the payload must match the declared `Content-Type` (prevents spoofing) |

Valid requests are forwarded to R2 transparently. Invalid requests receive a structured `400 JSON` error before touching storage.

---

## Quick Start

You can run the services either locally (by manually installing their dependencies) or via Docker Compose.

### Local Development Setup

To run the services locally without Docker, install the dependencies for each service individually:

```bash
# 1. Install dependencies for Express Server
cd "Express Server" && npm install

# 2. Install dependencies for Worker System
cd "../Worker System" && npm install

# 3. Install dependencies for Email System
cd "../Email System" && npm install

# 4. Install dependencies for Frontend
cd ../Frontend && npm install
```

After installing dependencies, configure the `.env` files in each service directory and start each service using its local scripts (e.g., `npm run dev` or `npm run worker`).

---

### Running with Docker Compose

You can also spin up the entire microservices architecture, including the database and message broker, using Docker Compose.

#### Step 1: Setup Environment Variables

Before starting the containers, you must manually create a `.env` file in each service directory (`Express Server`, `Worker System`, `Email System`, and `Frontend`). Ensure you configure your database URL, Redis host, and the necessary API keys as outlined below.

**Required API Keys:**

*   **OpenAI API Key (Worker System)**: Sign in to the [OpenAI Platform](https://platform.openai.com/), navigate to API keys, create a new secret key, and save it as `OPENAI_API_KEY`.
*   **Resend API Key (Email System)**: Sign in to the [Resend Dashboard](https://resend.com/), navigate to API Keys, create a new key, and save it as `RESEND_API_KEY`.
*   **Cloudflare R2 Credentials (Express Server & Worker System)**: Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to R2, create a bucket (`R2_BUCKET_NAME`), and manage R2 API tokens to get your `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`.

#### Step 2: Start the Application

Once the `.env` files are configured, build and run the services in detached mode:

```bash
docker compose up --build -d
```

#### Step 3: Accessing the Services

After a successful startup, the services will be available at the following local endpoints:

*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Express Backend API**: [http://localhost:8000](http://localhost:8000)
*   **MongoDB**: `localhost:27017`
*   **Redis**: `localhost:6379`

#### Stopping the Application

To safely shut down the containers without deleting your database and redis volumes:

```bash
docker compose down
```

To shut down and wipe all data volumes (useful for a clean reset, which is necessary if you need to reinitialize MongoDB credentials):

```bash
docker compose down -v
```