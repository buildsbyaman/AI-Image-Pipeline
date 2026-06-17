# AI Image Pipeline

An AI-powered media processing application featuring a complete full-stack architecture. This project combines a modern React frontend, a robust Node.js/Express main backend, an AI Processing Worker Microservice, and a dedicated Notification Microservice. It supports JWT-based authentication, PostgreSQL database management using Prisma, secure direct-to-cloud file uploads via Cloudflare R2, BullMQ background job queues for image processing and notifications, and a sleek dark-mode UI.

## Key Features

* **Full-Stack Architecture**: React/Vite frontend decoupled from an Express.js/TypeScript backend.
* **AI Processing Worker Microservice**: Standalone worker service processing image pipelines asynchronously using BullMQ. Performs image captioning (Hugging Face Salesforce/blip), label detection (Google Vision API), and safety moderation screening.
* **Notification Microservice**: Standalone asynchronous notification service using BullMQ + Redis + Resend for processing email pipelines.
* **Authentication System**: Production-ready JWT authentication with Access/Refresh token rotation, secure HTTP-only cookies, and hashed passwords via bcrypt.
* **Cloudflare R2 Integration**: Direct-to-R2 file uploads using presigned URLs and the AWS SDK v3, avoiding backend memory bottlenecks for large files.
* **Relational Database**: PostgreSQL integration configured through Prisma ORM for User management, File metadata tracking, Job status updates, and Notification auditing.
* **Backend Observability**: Centralized Winston logger tracking HTTP requests and errors via Morgan and custom middleware.
* **Premium Auth Screens**: Login, Registration, and passcode verification (OTP) flows matching sleek modern design patterns.
* **Smooth Interactive Layout**: Collapsible sidebar with high-performance, layout-cropped transitions (zero jitter), drag-and-drop file uploads, and dynamic status badges.

## Tech Stack

### Frontend
* **Core**: React 19, TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **Forms**: react-hook-form, Zod
* **Icons**: Lucide React

### Main Backend
* **Core**: Express.js, Node.js, TypeScript
* **Database**: PostgreSQL
* **ORM**: Prisma (with adapter-pg)
* **Storage**: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`
* **Security**: JWT, bcryptjs, Helmet, CORS, express-rate-limit
* **Logging**: Winston, Morgan

### AI Processing Worker
* **Core**: TypeScript, Node.js
* **Queue System**: BullMQ with Redis
* **AI Providers**: Hugging Face Inference API (`Salesforce/blip-image-captioning-base`), Google Cloud Vision API (Label & SafeSearch Detection)
* **Database**: PostgreSQL (Prisma, sharing `media_pipeline` DB)
* **Storage**: Cloudflare R2 Integration

### Notification Microservice
* **Core**: Express.js, TypeScript, Node.js
* **Queue System**: BullMQ with Redis
* **Email Provider**: Resend SDK
* **Database**: PostgreSQL (Prisma, sharing `media_pipeline` DB)
* **Templating**: Dynamic HTML/Text rendering engine

## Project Structure

```
├── server/                 # Express.js Backend
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── config/         # Environment validation (Zod)
│   │   ├── middleware/     # Auth, Error, and Rate limiting middlewares
│   │   ├── modules/        # Domain-driven feature modules (Auth, Files)
│   │   ├── services/       # Cloudflare R2 Storage and API integrations
│   │   └── utils/          # Winston logger, error handlers, bcrypt utilities
│   ├── app.ts              # Express application setup
│   └── index.ts            # Server entry point
│
├── Worker System/          # Standalone AI Processing Worker Microservice
│   ├── prisma/             # Schema mirroring shared database tables
│   ├── src/
│   │   ├── config/         # Environment variables & connection settings
│   │   ├── queues/         # BullMQ queue configuration
│   │   ├── repositories/   # Database access layer (Prisma JobRepository)
│   │   ├── services/       # AI processing pipelines & Notification publisher
│   │   ├── workers/        # BullMQ processing logic
│   │   └── worker.ts       # Worker entry point
│   └── api.md              # Worker Queue & Event API documentation
│
├── Notification Service/   # Standalone Notification Microservice
│   ├── prisma/             # Schema mirroring shared database tables
│   ├── scripts/            # Testing scripts (e.g. test-templates.ts)
│   ├── src/
│   │   ├── config/         # Env and redis configs
│   │   ├── controllers/    # Express controllers
│   │   ├── queues/         # BullMQ queue definitions
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Email & Notification processing
│   │   ├── templates/      # SaaS-style HTML and plaintext templates
│   │   ├── utils/          # Logger and Template Engine
│   │   ├── worker.ts       # BullMQ worker process entry point
│   │   └── server.ts       # Express API server entry point
│   └── api.md              # Notification Service REST API documentation
│
└── src/                    # React Frontend
    ├── components/         # Reusable UI (Auth forms, Upload zones, AppShell)
    ├── context/            # Global state (AuthContext, ToastContext)
    ├── lib/                # Axios API instances with interceptors
    └── pages/              # Primary views (Dashboard, Login, Signup)
```

## Security Features

- **Token Security**: Refresh tokens are stored strictly as HTTP-only secure cookies. Only short-lived access tokens are accessible to JavaScript memory.
- **Direct Uploads**: The frontend securely requests a time-limited presigned URL from the backend to upload files directly to Cloudflare R2, mitigating malicious payloads traversing the backend.
- **Global Error Handling**: Unhandled exceptions are scrubbed of stack traces in production environments before reaching the user.
