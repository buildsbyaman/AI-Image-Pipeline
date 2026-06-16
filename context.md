# AI-Powered Media Processing Platform — Frontend Context

## Project Overview

This project is a production-style AI-powered media processing platform.

Users upload images, and the backend asynchronously processes them through multiple AI stages:

1. Image Captioning
2. Object/Label Detection
3. Content Safety Moderation

The frontend is a modern SaaS dashboard inspired by:

* Vercel
* Linear
* Supabase
* Raycast

The goal is to create a premium, clean, scalable frontend with reusable React components and excellent UX.

---

# Core Tech Stack

## Frontend

* React
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion
* React Hook Form
* Zod
* Zustand
* TanStack Query (React Query)
* Lucide React Icons

## Backend (Context Only)

* Node.js
* Express/NestJS
* BullMQ + Redis
* PostgreSQL
* Prisma
* S3 / Cloudflare R2
* Dockerized architecture

---

# Design Philosophy

The UI MUST feel:

* minimal
* premium
* developer-focused
* modern SaaS
* highly polished

Avoid:

* clutter
* large gradients
* excessive colors
* oversized buttons
* flashy animations
* heavy glassmorphism
* rounded cartoonish UI

Preferred visual style:

* dark mode first
* subtle borders
* muted surfaces
* layered cards
* soft shadows
* large whitespace
* thin separators
* clean typography hierarchy

---

# UI Design Rules

## Layout

* Use consistent spacing scale
* Prefer grids and flex layouts
* Mobile-first responsive design
* Keep content aligned and breathable

## Colors

Use mostly:

* neutral backgrounds
* grayscale surfaces
* one primary accent color

Avoid:

* rainbow palettes
* neon colors
* oversaturated UI

## Typography

Hierarchy:

* large headings
* muted secondary text
* compact labels
* developer-dashboard aesthetics

Use:

* semibold headings
* muted descriptions
* tight spacing

---

# Architecture Rules

## VERY IMPORTANT

This frontend is:

* component-driven
* reusable
* modular
* scalable

DO NOT:

* create giant monolithic files
* duplicate UI logic
* tightly couple components
* hardcode repeated values

ALWAYS:

* extract reusable components
* use composition patterns
* separate layout from business logic
* create shared UI primitives

---

# Folder Structure

Preferred structure:

src/
├── app/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── jobs/
│   ├── upload/
│   ├── auth/
│   └── shared/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
└── utils/

---

# Component Standards

All components should:

* use TypeScript interfaces
* support reusability
* accept className props where appropriate
* avoid inline styles
* use Tailwind utilities
* support loading states
* support empty states
* support accessibility

---

# Shared Components

Expected reusable components:

## Layout

* AppShell
* Sidebar
* Navbar
* MobileDrawer
* PageContainer
* PageHeader

## Data Display

* MetricCard
* StatusBadge
* AIResultCard
* Timeline
* DataTable
* ActivityFeed

## Upload

* UploadDropzone
* FilePreviewCard
* UploadProgress

## States

* EmptyState
* LoadingState
* SkeletonLoader
* ErrorState

## Actions

* RetryButton
* ActionDropdown
* FilterBar

---

# Authentication Screens

## Login

Must include:

* email/password
* remember me
* forgot password
* social placeholders
* loading states
* validation states

## Signup

Must include:

* password strength
* confirm password
* terms checkbox
* validation

Both pages should:

* share auth layout
* use centered card design
* have premium minimal styling

---

# Dashboard Requirements

Dashboard includes:

* metric overview cards
* recent jobs table
* AI activity feed
* queue status
* upload CTA

Metrics:

* total uploads
* processing jobs
* failed jobs
* flagged content

---

# Upload Flow

Supported file types:

* JPG
* PNG
* WEBP

Maximum file size:

* 5MB

Upload UX must include:

* drag and drop
* progress states
* validation
* previews
* retry handling
* animated transitions

---

# Jobs List Page

Jobs must display:

* thumbnail
* filename
* status
* upload date
* processing duration

Statuses:

* pending
* processing
* completed
* failed
* flagged

Must support:

* filtering
* sorting
* pagination
* retry actions

---

# Job Details Page

Must contain:

1. Uploaded image
2. Caption result
3. Label results
4. Safety moderation
5. Metadata
6. Processing timeline
7. Logs
8. Retry actions

Safety section:

* highlight flagged content clearly
* use warning cards
* show moderation confidence

---

# Flagged Content Page

Purpose:
Moderation review interface.

Must clearly distinguish:

* unsafe content
* flagged categories
* confidence levels

---

# Settings Page

Must include:

* profile settings
* password/security
* notifications
* theme preferences
* API keys
* connected services

---

# UX Rules

## Loading States

ALWAYS use:

* skeleton loaders
* optimistic UI where possible
* subtle transitions

## Animations

Use Framer Motion minimally:

* fade
* scale
* slide
* hover transitions

Avoid:

* bouncy animations
* flashy motion
* distracting effects

---

# Accessibility Rules

All UI must:

* support keyboard navigation
* use semantic HTML
* include labels
* include focus states
* maintain contrast ratios

---

# State Management

## Zustand

Use for:

* UI state
* sidebar state
* theme state

## React Query

Use for:

* API data fetching
* caching
* retries
* server state

DO NOT use Zustand for server state.

---

# Form Standards

Use:

* React Hook Form
* Zod validation

Forms must support:

* loading states
* validation states
* error messages
* disabled states

---

# Code Quality Rules

DO:

* create modular files
* keep components small
* strongly type props
* abstract repeated patterns
* use reusable hooks

DO NOT:

* use any
* hardcode API data
* mix business logic with UI
* create deeply nested JSX unnecessarily

---

# Mock Data

Until backend integration:

* use realistic mock data
* maintain consistent schemas
* simulate async loading

---

# Final Goal

The application should feel like a polished production SaaS product that could realistically be deployed publicly.

The frontend quality should resemble:

* Vercel dashboard
* Linear
* Supabase
* modern developer tooling platforms

Every screen should feel:

* intentional
* spacious
* fast
* elegant
* highly reusable
* scalable
