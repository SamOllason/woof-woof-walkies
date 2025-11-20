# Project Specification

## Project Overview
<!-- Brief description of what the application does and its purpose -->
**Project Name:** Woof woof walkies
**Type:** Full stack React TypeScript Web Application.
**Description:** [1-2 paragraphs describing the app]

## Some more context

The core purpose of this project is for me to keep learning and understanding and growing my skills.

I am a senior software engineer who has worked with React, TypeScript, Node, Mongo but not for several years.

I want to increase my understanding of cutting edge and modern full stack development with React, TypeScript and PostGresSQL, while also creating a relatively simple project for my portfolio.

Bearing that in mind, I want you to be my tutor and guide me through creating this application each step of the way, presenting me the pros and cons of each choice. Please explain things me like a fellow senior engineer.

I want to take a TDD approach where possible.

## Technical Requirements

### Frontend
- **Framework:** Next.js 14+ (App Router) with React 18+
- **Language:** TypeScript
- **Build Tool:** Next.js built-in (Turbopack in dev)
- **Styling:** Tailwind CSS
- **State Management:** React built-in (useState, Server Components) - add libraries only if needed
- **Routing:** Next.js App Router (file-based routing)

### Backend/API
- **Type:** Supabase (PostgreSQL + Auto-generated REST API)
- **Database:** PostgreSQL (hosted by Supabase)
- **Authentication:** Supabase Auth (email/password + OAuth)
- **Authorization:** Row-Level Security (RLS) policies
- **Real-time:** Supabase Realtime subscriptions

### Key Dependencies
- **@supabase/supabase-js**: Supabase client SDK
- **@supabase/ssr**: Server-side auth for Next.js
- **tailwindcss**: Utility-first CSS framework
- **vitest**: Testing framework (faster than Jest)
- **@testing-library/react**: Component testing
- **typescript**: Type safety
- **react-hot-toast**: Toast notifications for user feedback

## Technical Features

This project demonstrates several advanced patterns and best practices that showcase modern React development expertise:

 1. Optimistic UI Updates using Advanced React patterns for responsive user experiences using React's `useOptimistic` hook, (providing instant feedback to users without waiting for server confirmation) and `useTransition` shows pending states with dimmed UI during operations



### 2. React Server Components Architecture
**What it demonstrates:** Modern Next.js 15 patterns and understanding of client/server boundaries

The application properly separates Server Components (for data fetching) from Client Components (for interactivity), optimizing bundle size and performance.

**Key patterns:**
- Server Components fetch data at the edge with zero client JavaScript
- Client Components marked with `'use client'` handle interactivity
- Server Actions (`'use server'`) enable type-safe mutations
- Proper props passing between server and client boundaries

### 3. Test-Driven Development (TDD)
- Edge cases (empty states, cancellations)

### 4. Type-Safe Database with Row-Level Security  Security-first development and PostgreSQL expertise

- Supabase RLS policies ensure users can only access their own data
- TypeScript types generated from database schema
- Server-side auth validation on every request
- Protection against IDOR (Insecure Direct Object Reference) attacks

### 5. Modern Form Handling including
- Server Actions for form submissions (works without JavaScript)
- Client-side validation for immediate feedback
- Consistent error handling patterns
- NEXT_REDIRECT handling for post-mutation navigation

