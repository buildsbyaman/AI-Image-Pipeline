# Notification Microservice

A standalone microservice for the AI Image Processing Platform responsible for queuing and sending email notifications using Resend, BullMQ, and PostgreSQL.

## Architecture

This service uses a clean architectural pattern:
`Controller -> Service -> Repository`

- **Database**: PostgreSQL (managed by Prisma ORM)
- **Queue**: BullMQ + Redis for processing background email jobs
- **Email Provider**: Resend
