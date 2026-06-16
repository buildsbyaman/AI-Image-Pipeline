# AI Image Pipeline

An AI-powered media processing dashboard combining a ChatGPT-style layout with modern Vercel/Linear aesthetics. This application supports custom prompt-based image processing workflows with dynamic job status tracking, smooth layout animations, and premium dark-mode styling.

## 🚀 Key Features

* **AI Processing Dashboard**: ChatGPT-inspired workspace layout to queue image enhancement or moderation tasks.
* **Smooth Interactive Layout**: Collapsible sidebar with high-performance, layout-cropped transitions (zero jitter).
* **Decoupled Architecture**: Fully modular design separating UI layouts, authentication form elements, core state, and simulation hooks.
* **Premium Auth Screens**: Login, Registration, and passcode verification (OTP) flows matching sleek modern design patterns.
* **Dynamic Media Feed**: Real-time status badges, image maximize views, and download tools.

## 🛠️ Tech Stack

* **Core**: React 19, TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion
* **Icons**: Lucide React

## 📂 Project Structure

```
src/
├── assets/         # Global vector assets and logos
├── components/     # Reusable modular components
│   ├── auth/       # LoginForm, SignupForm, OtpRequestForm, OtpVerificationForm, OtpInput
│   ├── layout/     # AppShell, Sidebar, SidebarHistory, SidebarFooter, UserProfile, LogoutButton
│   └── ui/         # JobCard, MediaFeed, UploadComposer, WelcomeScreen, Button, Input, Label
├── context/        # DashboardContext managing application state
├── hooks/          # Hooks for components logic
├── lib/            # Tailwind and layout utilities
├── pages/          # Main route components (Dashboard, Login, Signup, Otp)
├── App.tsx         # Main entry router configuration
└── main.tsx        # React mounting and initialization
```

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18+)
* npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Build the production package:
   ```bash
   npm run build
   ```
