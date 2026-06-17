# Notification Microservice

A standalone microservice for the AI Image Processing Platform responsible for queuing, managing, and sending email notifications using Resend, BullMQ, and PostgreSQL.

It operates under a decoupled, separate-process architecture consisting of:
1. **API Server**: An Express app that exposes HTTP endpoints to list, retrieve, retry, or queue notification requests.
2. **Queue Worker**: A BullMQ worker that processes background jobs off Redis, interacts with the Resend API, and logs status to PostgreSQL.

---

## Technical Stack

- **Core**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL (Prisma Client v5.22.0)
- **Queue System**: BullMQ + Redis
- **Email Service**: Resend SDK
- **Templating**: Dynamic template engine supporting HTML (dark mode SaaS design matching `design.md`) and plaintext formats.

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed and running locally:
- **Node.js** (v18+)
- **PostgreSQL** (running locally, database `media_pipeline` created)
- **Redis**:
  - Install via Homebrew: `brew install redis`
  - Start Redis service: `brew services start redis` (or `redis-server` in a separate terminal)

### 2. Environment Configuration

Create a `.env` file in the root of the `Notification Service/` directory matching the following layout:

```env
# Server Configuration
PORT=5005
NODE_ENV=development

# Database Configuration (Shares media_pipeline database with Main App)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/media_pipeline?schema=public

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Resend API Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

### 3. Database Setup

To prevent Prisma from dropping existing tables (`User`, `File`) used by the main application during database syncs, the Notification Service mirrors these models in its `prisma/schema.prisma` file alongside its own `Notification` model.

Run the following commands to generate Prisma client:

```bash
# Generate Prisma Client
npm run prisma:generate

# Sync schema definitions (if needed)
# Avoid prisma migrate dev if it tries to reset tables; use db push to sync notification tables safely
npx prisma db push
```

### 4. Running the Service

You can start both the **API Server** and **Queue Worker** concurrently in development mode using a single command:

```bash
npm run dev
```

This runs both components side-by-side using `concurrently`, with separate color-coded logging outputs.

---

## Directory Layout

```
├── prisma/
│   └── schema.prisma        # Database schema definition
├── scripts/
│   └── test-templates.ts   # Script to send test emails with custom mock data
├── src/
│   ├── config/
│   │   ├── env.ts          # Zod schema environment validation
│   │   └── redis.ts        # Redis client configuration
│   ├── controllers/
│   │   └── NotificationController.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validateRequest.ts
│   ├── queues/
│   │   └── emailQueue.ts   # BullMQ email queue definition
│   ├── routes/
│   │   └── notificationRoutes.ts
│   ├── services/
│   │   └── EmailService.ts # Interfaces with Resend SDK
│   ├── templates/
│   │   ├── adult-content-flagged.html
│   │   ├── adult-content-flagged.txt
│   │   ├── image-processed-successfully.html
│   │   └── image-processed-successfully.txt
│   ├── utils/
│   │   ├── logger.ts
│   │   └── templateEngine.ts  # Compiles and injects parameters into HTML/Text templates
│   ├── server.ts           # API Entrypoint
│   └── worker.ts           # Worker Entrypoint
```

---

## Template System

The service has a custom templating system under `src/templates` which generates highly responsive, dark-mode SaaS emails matching `design.md`.

Each template is composed of:
- A `.html` file containing responsive modern layouts and CSS.
- A `.txt` file containing the plain-text alternative.

### Available Templates:
1. **Adult Content Flagged (`adult-content-flagged`)**
   - **Subject**: `⚠️ Content Review Required - Upload Flagged`
   - **Variables**: `{{USER_NAME}}`, `{{JOB_ID}}`, `{{FLAGGED_CATEGORY}}`, `{{APP_NAME}}`, `{{YEAR}}`
2. **Image Processed Successfully (`image-processed-successfully`)**
   - **Subject**: `✅ Image Processing Complete`
   - **Variables**: `{{USER_NAME}}`, `{{JOB_ID}}`, `{{APP_NAME}}`, `{{YEAR}}`
