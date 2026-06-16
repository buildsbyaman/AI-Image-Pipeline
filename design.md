# Design System & Premium UI Specification

This project follows a strict developer-focused SaaS aesthetic inspired by platforms like Vercel, Linear, Supabase, and Raycast. Keep designs flat, minimal, and highly consistent.

## Theme & Palette

*   **Main Background**: Deep graphite/charcoal surface (`#09090B`). Includes a very subtle radial highlight (`circle at top, rgba(255,255,255,0.04), transparent 35%`) for atmospheric depth.
*   **Card Surface**: Solid elevated charcoal surface (`#111113`) with generous padding.
*   **Elevated Sections**: Neutral gray surface (`#18181B`).
*   **Borders**: Thin, subtle, and low-contrast borders (`#27272A` / `border-zinc-800`).
*   **Primary Typography**: Pure bright primary text (`#FAFAFA`) paired with secondary (`#A1A1AA`) and muted (`#71717A`) zinc colors.

## Form Elements

*   **Inputs**:
    *   Background: Deep matte gray (`bg-zinc-900`).
    *   Borders: Thin, high-density slate borders (`border-zinc-800`).
    *   Focus: Smooth, premium ring/border (`focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400`).
*   **Checkboxes**: Flat design matching input colors with neutral active rings.

## Buttons System

*   **Primary Button**: Minimal, premium, and intentional solid white background with black/dark text.
    *   Classes: `bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm border border-transparent transition-all duration-200`
*   **Secondary Button**: Dark charcoal surfaces with subtle borders.
    *   Classes: `bg-zinc-900 text-[#FAFAFA] border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700`
*   **Ghost Button**: Neutral transparent items.
    *   Classes: `hover:bg-zinc-800/80 text-zinc-300 hover:text-white`

## Navigation & Links

*   Use secondary links transitioning to bright white on hover (`text-[#A1A1AA] hover:text-[#FAFAFA]`).

## OTP (One-Time Passcode) Screen

*   **Width**: Max-width of `max-w-[400px]` (single column credentials layout).
*   **OTP Codes**:
    *   6 separate numeric inputs styled side-by-side.
    *   Background: Deep dark blueish grey (`bg-[#0A0A0A]/50` or `#0A0F1D`).
    *   Border: Subtle borders (`border-zinc-800`).
    *   Focus: Highlights the field with a thin border/ring (`focus-visible:ring-zinc-400 focus-visible:border-zinc-400 focus-visible:bg-zinc-900`).
    *   Autofocus sequence: Automatically advance target focus on input values and delete backward on backspace.

