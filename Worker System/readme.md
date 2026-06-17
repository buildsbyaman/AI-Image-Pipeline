# AI Processing Worker Microservice

This is a standalone microservice responsible for processing image pipelines asynchronously using BullMQ.

## Features

- **Queue Consumption**: Listens to the `image-processing` BullMQ queue.
- **Multi-Step AI Pipeline**:
  - Image Captioning via Hugging Face (`Salesforce/blip-image-captioning-base`).
  - Label Detection via Google Vision API.
  - Content Safety Moderation via Google Vision API (`safeSearchDetection`).
- **Storage Integration**: Streams processing buffers directly from Cloudflare R2 privately.
- **Database Persistence**: Updates `Job` statuses and creates `Result` records using Prisma (PostgreSQL).
- **Notification Integration**: Dispatches notifications by publishing to a `notifications` queue.

## Tech Stack

- Node.js & TypeScript
- BullMQ & Redis
- Prisma ORM & PostgreSQL
- AWS SDK v3 (Cloudflare R2)
- Google Vision API
- Hugging Face Inference API

## Scripts

- `npm run worker`: Starts the worker process
- `npm run build`: Compiles TypeScript
- `npm run prisma:generate`: Generates Prisma client
- `npm run prisma:migrate`: Runs migrations
