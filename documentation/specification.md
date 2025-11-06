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

## Philosophy

**Keep It Simple:** Start with the simplest solution that works. Add complexity (state management, caching libraries, etc.) only when there's a clear need. This is a learning project - focus on fundamentals first.

## Core User Stories
<!-- Describe what users should be able to do -->
- 1) Add a walk: As a dog walker, I want to add new walks to be saved so that I can refer to them in the future
- 2) Log an instance of walk: As a dog walker, I want to log an instance of a previously saved walk so that I can see how often I visit certain places and see trends over time favourites.
- 3) Admin all walks for all users: As an admin, I want to be able to see all walks for all users in one central place.

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

**Note:** Start minimal. Add libraries (React Query, Zustand, etc.) only when complexity demands it.
