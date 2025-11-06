# Future Learning & Alternative Approaches

This document tracks concepts and patterns we're skipping in this project that would be valuable to learn in future projects.

---

## Authentication Patterns

### What We're Using: Supabase Auth
- Built-in email/password, OAuth, magic links
- Handled entirely by Supabase SDK
- Row-level security (RLS) for permissions

### What to Learn in Future Projects:

#### NextAuth.js (Auth.js) v5
**What you'd build:**
- Session management (JWT or database sessions)
- OAuth provider configuration (Google, GitHub, etc.)
- Custom sign-in/sign-up flows
- Protected API routes and Server Components
- Role-based access control (RBAC)

**Why learn it:**
- Industry standard for Next.js apps
- More control over auth flow
- Works with any database
- Better understanding of JWT, sessions, cookies

**Getting started:**
```bash
npm install next-auth@beta
```
- Configure providers in `app/api/auth/[...nextauth]/route.ts`
- Protect routes with `getServerSession()`
- Learn about middleware for auth checks

---

## Database Access Patterns

### What We're Using: Supabase SDK
- Auto-generated REST API
- Direct queries from client components
- Real-time subscriptions built-in

### What to Learn in Future Projects:

#### Option A: Prisma ORM with Custom API Layer
**What you'd build:**
- Define schema in `prisma/schema.prisma`
- Run migrations: `prisma migrate dev`
- Build API routes or Server Actions
- Manual connection pooling setup

**Why learn it:**
- Full control over data access
- Better for complex business logic
- Type-safe end-to-end
- Works with any PostgreSQL host (Neon, Railway, etc.)

**Getting started:**
```bash
npm install prisma @prisma/client
npx prisma init
```
- Define your schema
- Create migrations
- Use Prisma Client in Server Components/Actions

**Connection pooling with Neon:**
- Use Neon's pooled connection string
- Configure `pgBouncer` mode
- Understand connection limits with serverless

#### Option B: Drizzle ORM
**What you'd build:**
- Type-safe queries closer to raw SQL
- Migrations via Drizzle Kit
- More lightweight than Prisma

**Why learn it:**
- Better TypeScript inference
- Less magic, more control
- Closer to SQL (better learning)

**Getting started:**
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

#### Option C: Raw SQL with node-postgres
**What you'd build:**
- Write SQL queries manually
- Handle migrations yourself (node-pg-migrate)
- Build query builders if needed

**Why learn it:**
- Deep PostgreSQL knowledge
- Maximum control and performance
- No ORM abstraction

---

## API Architecture Patterns

### What We're Using: Supabase Auto-Generated APIs
- No API routes needed
- Queries happen via Supabase SDK
- RLS policies handle security

### What to Learn in Future Projects:

#### Next.js API Routes
**What you'd build:**
```typescript
// app/api/walks/route.ts
export async function GET(request: Request) {
  const walks = await prisma.walk.findMany()
  return Response.json(walks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const walk = await prisma.walk.create({ data: body })
  return Response.json(walk)
}
```

**Why learn it:**
- Full control over API design
- Complex business logic
- Custom error handling
- Rate limiting, caching

#### Server Actions (Modern Next.js)
**What you'd build:**
```typescript
'use server'
export async function createWalk(formData: FormData) {
  const data = {
    name: formData.get('name'),
    distance: Number(formData.get('distance'))
  }
  await prisma.walk.create({ data })
  revalidatePath('/walks')
}
```

**Why learn it:**
- Progressive enhancement (works without JS)
- Simpler than API routes for mutations
- Direct integration with Server Components
- Modern Next.js pattern (2024+)

#### REST API Best Practices
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Status codes (200, 201, 400, 401, 404, 500)
- Error handling patterns
- Pagination, filtering, sorting
- API versioning

---

## State Management & Data Fetching

### What We're Using: Supabase SDK
- Direct DB queries from components
- Built-in real-time subscriptions
- Simple loading/error states

### What to Learn in Future Projects:

#### TanStack Query (React Query)
**What you'd use it for:**
- Caching server state
- Background refetching
- Optimistic updates
- Request deduplication

**Getting started:**
```bash
npm install @tanstack/react-query
```
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['walks'],
  queryFn: () => fetch('/api/walks').then(r => r.json())
})

const mutation = useMutation({
  mutationFn: (newWalk) => fetch('/api/walks', {
    method: 'POST',
    body: JSON.stringify(newWalk)
  })
})
```

**Why learn it:**
- Industry standard for server state
- Sophisticated caching strategies
- Better UX with stale-while-revalidate

#### Client State Management
- **React Context**: Built-in, good for simple global state
- **Zustand**: Minimal, modern, easy to learn
- **Redux Toolkit**: Enterprise standard, more complex

**When you'd need it:**
- Complex UI state (multi-step forms, filters)
- State shared across many components
- Time-travel debugging needs

---

## Real-time Features

### What We're Using: Supabase Real-time
- PostgreSQL change subscriptions
- Built-in WebSocket handling
- Automatic reconnection

### What to Learn in Future Projects:

#### WebSockets with Socket.io
**What you'd build:**
- WebSocket server (separate or in Next.js API route)
- Event-based communication
- Room/namespace management

**Why learn it:**
- More control over real-time logic
- Works without Supabase
- Chat apps, collaborative tools, live notifications

#### Server-Sent Events (SSE)
**Simpler alternative to WebSockets:**
- One-way server → client updates
- Built on HTTP
- Good for live feeds, notifications

---

## Database Hosting Alternatives

### What We're Using: Supabase
- PostgreSQL + auth + real-time + storage
- Free tier: 500MB database, 2GB bandwidth
- Built-in connection pooling

### Alternatives to Explore:

#### Neon
**What it offers:**
- Just PostgreSQL, nothing else
- Serverless: scales to zero (save costs)
- Branch databases (like git branches)
- Excellent for Next.js on Vercel

**When to use:**
- You want to build your own backend layer
- Learning Prisma/Drizzle
- Don't need real-time features

**Connection pooling:**
- Neon provides pooled connection strings
- Use `?pgbouncer=true` in connection string
- Important for serverless functions

#### Railway / Render
**Traditional PostgreSQL hosting:**
- Long-lived server (not serverless)
- More like traditional deployment
- Good for learning production ops

#### Local PostgreSQL
**For development:**
- Install PostgreSQL locally
- Run via Docker
- Full control, no internet needed

```bash
# Docker example
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

---

## Testing Patterns

### What We're Learning: TDD with Vitest
- Testing components
- Testing user interactions

### What to Explore Deeper:

#### Integration Testing
- Test API routes in isolation
- Test database interactions
- Test auth flows end-to-end

#### E2E Testing with Playwright
**What you'd build:**
- Full user flow tests
- Cross-browser testing
- Visual regression tests

```bash
npm install -D @playwright/test
```

#### Testing with Supabase
- Use local Supabase instance
- Seed test data
- Reset DB between tests

---

## Deployment & DevOps

### What We're Using: Vercel
- One-click deployment
- Automatic previews for PRs
- Edge functions

### What to Learn:

#### Docker & Container Deployment
- Containerize Next.js app
- Deploy to Railway, Render, AWS
- Understand server architecture

#### CI/CD Pipelines
- GitHub Actions
- Automated testing before deploy
- Database migration strategies

#### Environment Management
- Development, staging, production
- Environment variables
- Database per environment

---

## React Compiler (Experimental)

### What We're Using: Standard React (Manual Optimization)
- Manual use of `React.memo`, `useMemo`, `useCallback`
- Understanding re-render behavior
- Performance optimization by hand

### What to Learn in Future:

#### React Compiler (React Forget)
**What it does:**
- Automatically memoizes components and values
- Eliminates unnecessary re-renders without manual optimization
- You write simpler code, compiler handles performance

**Why learn it:**
- Future of React optimization (when stable)
- Understand how auto-optimization works
- Cleaner component code

**When to explore:**
- After it's production-ready (likely 2026+)
- After you understand manual optimization patterns
- When you know WHY re-renders happen

**Getting started (when ready):**
```bash
npm install babel-plugin-react-compiler
```
- Configure in Next.js config
- Gradually adopt in existing codebase
- Compare performance before/after

**Important:** Learn manual optimization FIRST so you understand what the compiler is doing for you.

---

## Advanced PostgreSQL Concepts

### We're Using Basic Tables & RLS

### What to Learn:

#### Advanced SQL
- Complex joins and subqueries
- Window functions
- CTEs (Common Table Expressions)
- Full-text search
- Indexes and query optimization

#### Database Design Patterns
- Normalization vs denormalization
- Composite keys
- Soft deletes
- Audit logs
- Database migrations strategies

#### Row-Level Security (RLS) Deep Dive
- Policy design patterns
- Performance implications
- Testing RLS policies

---

## Future Project Ideas

### 1. **E-commerce App** (Neon + Prisma + NextAuth)
Learn: Complex data models, transactions, payment integration

### 2. **Real-time Collaboration Tool** (Socket.io + Redis)
Learn: WebSockets, operational transforms, conflict resolution

### 3. **API-First Architecture** (Next.js API + Separate React SPA)
Learn: API design, CORS, separate frontend/backend deployment

### 4. **Monorepo Full-Stack** (Turborepo + pnpm)
Learn: Code sharing, build pipelines, multi-package management

### 5. **Microservices** (Multiple Node services + PostgreSQL)
Learn: Service communication, API gateways, distributed systems

---

## Resources to Explore

### Documentation
- Next.js App Router: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Drizzle: https://orm.drizzle.team
- NextAuth: https://authjs.dev
- TanStack Query: https://tanstack.com/query

### Learning Platforms
- Next.js Learn: https://nextjs.org/learn
- PostgreSQL Tutorial: https://www.postgresqltutorial.com
- Prisma's "Speed Run" tutorials

---

_This document will be updated as we make choices throughout the project._
