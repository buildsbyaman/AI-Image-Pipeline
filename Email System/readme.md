# Email & Notification Service

A standalone microservice for the AI Image Processing Platform responsible for queuing, managing, and sending email notifications using Resend and BullMQ.

It operates under a decoupled architecture consisting of:
1. **API Server**: An Express app that exposes HTTP endpoints (currently a `/health` check, serving as an entry point for extensibility).
2. **Queue Worker**: A BullMQ worker that processes background jobs off Redis and interacts with the Resend API.

---

## Technical Stack

- **Core**: Node.js, TypeScript, Express.js
- **Queue System**: BullMQ + Redis
- **Email Service**: Resend SDK
- **Templating**: Dynamic template engine supporting HTML (dark mode SaaS design) and plaintext formats.

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed and running locally:
- **Node.js** (v18+)
- **Redis**

### 2. Environment Configuration

Create a `.env` file in the root of the `Email System/` directory:

```env
PORT=5005
NODE_ENV=development

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Resend API Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

### 3. Running the Service

You can start both the **API Server** and **Queue Worker** concurrently in development mode using a single command:

```bash
npm run dev
```

---

## Directory Layout

```text
src/
├── config.ts               # Flat configuration module validated with Zod
├── shared/
│   ├── logger.ts           # Shared Winston logger
│   ├── errors.ts           # AppError custom operational error helper
│   └── middleware.ts       # Express request validator and global error handler
├── features/
│   └── email/              # Encapsulated, self-contained Email Feature
│       ├── email.queue.ts  # Redis queue connection definition
│       ├── email.service.ts # Email sending logic interfacing with Resend SDK
│       ├── email.worker.ts # BullMQ worker processor
│       ├── templateEngine.ts # Compiles templates and injects variables
│       └── templates/      # Plaintext and HTML email templates
│           ├── flagged.html
│           ├── flagged.txt
│           ├── processed.html
│           └── processed.txt
├── app.ts                  # Express application setup
├── server.ts               # API entry point
└── worker.ts               # Worker entry point
```

---

## Template System

The service has a custom templating system under `src/features/email/templates` which generates responsive, dark-mode SaaS emails.

Each template is composed of:
- A `.html` file containing responsive modern layouts and CSS.
- A `.txt` file containing the plain-text alternative.

### Available Templates:
1. **Content Flagged (`flagged`)**
   - **Subject**: `Content Warning: Image Flagged`
   - **Variables**: `{{USER_NAME}}`, `{{JOB_ID}}`, `{{FLAGGED_CATEGORY}}`, `{{APP_NAME}}`, `{{YEAR}}`
2. **Image Processed Successfully (`processed`)**
   - **Subject**: `Image Processed Successfully`
   - **Variables**: `{{USER_NAME}}`, `{{JOB_ID}}`, `{{APP_NAME}}`, `{{YEAR}}`
