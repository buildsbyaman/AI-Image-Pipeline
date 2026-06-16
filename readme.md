# AI Image Pipeline

An AI-powered media processing application featuring a complete full-stack architecture. This project combines a modern React frontend with a robust Node.js/Express backend. It supports JWT-based authentication, PostgreSQL database management using Prisma, secure direct-to-cloud file uploads via Cloudflare R2, and a sleek dark-mode UI.

## Key Features

* **Full-Stack Architecture**: React/Vite frontend decoupled from an Express.js/TypeScript backend.
* **Authentication System**: Production-ready JWT authentication with Access/Refresh token rotation, secure HTTP-only cookies, and hashed passwords via bcrypt.
* **Cloudflare R2 Integration**: Direct-to-R2 file uploads using presigned URLs and the AWS SDK v3, avoiding backend memory bottlenecks for large files.
* **Relational Database**: PostgreSQL integration configured through Prisma ORM for User management and File metadata tracking.
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

### Backend
* **Core**: Express.js, Node.js, TypeScript
* **Database**: PostgreSQL
* **ORM**: Prisma (with adapter-pg)
* **Storage**: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3`
* **Security**: JWT, bcryptjs, Helmet, CORS, express-rate-limit
* **Logging**: Winston, Morgan

## Project Structure

```
├── server/             # Express.js Backend
│   ├── prisma/         # Prisma schema and migrations
│   ├── src/
│   │   ├── config/     # Environment validation (Zod)
│   │   ├── middleware/ # Auth, Error, and Rate limiting middlewares
│   │   ├── modules/    # Domain-driven feature modules (Auth, Files)
│   │   ├── services/   # Cloudflare R2 Storage and API integrations
│   │   └── utils/      # Winston logger, error handlers, bcrypt utilities
│   ├── app.ts          # Express application setup
│   └── index.ts        # Server entry point
│
└── src/                # React Frontend
    ├── components/     # Reusable UI (Auth forms, Upload zones, AppShell)
    ├── context/        # Global state (AuthContext, ToastContext)
    ├── lib/            # Axios API instances with interceptors
    └── pages/          # Primary views (Dashboard, Login, Signup)
```

## Security Features

- **Token Security**: Refresh tokens are stored strictly as HTTP-only secure cookies. Only short-lived access tokens are accessible to JavaScript memory.
- **Direct Uploads**: The frontend securely requests a time-limited presigned URL from the backend to upload files directly to Cloudflare R2, mitigating malicious payloads traversing the backend.
- **Global Error Handling**: Unhandled exceptions are scrubbed of stack traces in production environments before reaching the user.
