# Architecture & Technology Decisions

## Tech Stack Overview
- **Frontend:** React 18+ with TypeScript (strict mode)
- **Framework:** Next.js 15 (App Router) with Turbopack
- **Database:** PostgreSQL via Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Code Quality:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library (added after initial features)

---

## Key Decisions

### 1. Next.js (Full-Stack) vs Separate React + Node API
**Decision:** Next.js on Vercel

**Why:**
- Modern industry standard for full-stack React
- Better for portfolio (shows cutting-edge knowledge)
- Server Components and App Router are current best practices
- Simpler deployment story
- Faster to iterate
- Using Next.js 15 with Turbopack for cutting-edge dev experience

**Trade-offs:**
- ❌ More vendor coupling (Next.js conventions)
- ❌ Steeper learning curve (Server Components, RSC)
- ❌ Less clear frontend/backend separation
- ✅ Single codebase, shared types
- ✅ Better DX and performance out of the box
- ✅ Turbopack provides significantly faster dev server and hot reload

---

## Important Concepts to Remember

### Connection Pooling with Serverless
**Problem:** Next.js on Vercel uses serverless functions. Each API request can spin up a new function instance, and each might try to create its own PostgreSQL connection. PostgreSQL has connection limits (typically 100-200), so you can quickly exhaust them.

**Solution:** Use connection pooling
- **PgBouncer** - Connection pooler that sits between your app and database
- **Prisma Data Proxy** - Prisma's hosted connection pooler
- **Neon/Supabase** - Have built-in connection pooling for serverless

**In traditional Node API:** Long-lived server maintains a connection pool, so this is less of an issue.

---

## Technology Choices (Decided)

### Database & Backend: Supabase (Full Service)
**Decision:** Using Supabase for database, auth, and APIs

**Why:**
- All-in-one solution (PostgreSQL + Auth + Real-time + Storage)
- Faster to production (good for portfolio timeline)
- Built-in connection pooling (serverless-friendly)
- Row-Level Security (RLS) teaches PostgreSQL security patterns
- Real-time features out of the box

**Trade-offs:**
- ❌ Less learning about building auth/API layer from scratch
- ❌ More vendor coupling
- ✅ More time for UI/UX and features
- ✅ Modern BaaS patterns (valuable skill)
- ✅ Can migrate to custom backend later as learning exercise

**Architecture Overview:**
```
Next.js App
├── Server Components (fetch via Supabase SDK)
├── Client Components (can query DB directly via Supabase SDK!)
├── Supabase handles:
│   ├── Authentication
│   ├── Database API
│   ├── Row-level security
│   └── Real-time subscriptions
```

**Note:** See `future_learning_notes.md` for alternative approaches (Neon + Prisma, raw SQL, etc.)

### Authentication: Supabase Auth
- Email/password authentication
- Row-level security for data access
- Built-in session management

### State Management
**Options:** Supabase SDK for server state, React hooks for UI state
- Server data: Supabase real-time subscriptions
- Client state: Start simple (useState), add Zustand if needed

### Styling: Tailwind CSS
**Decision:** Tailwind CSS for styling

**Why:**
- Industry standard with Next.js
- Utility-first, fast development
- Want to learn Tailwind deeply for portfolio
- Great for rapid prototyping

**Learning goals:**
- Understand utility-first CSS approach
- Learn responsive design patterns with Tailwind
- Custom theming and configuration
- Component composition patterns

### Forms & Validation
**Decision:** TBD - React Hook Form + Zod (recommended)
- Best validation DX
- Type-safe schemas

### Testing Strategy
**Decision:** Add testing after initial features are built
- Vitest + React Testing Library
- Start with feature development first
- Add comprehensive tests once comfortable with stack

---

## Notes
- Taking TDD approach where possible
- Focus on modern patterns and best practices
- Keeping scope simple for learning and portfolio
