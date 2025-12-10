# 🐕 Woof Woof Walkies

> **AI-Powered Dog Walking Route Planner** - A production-ready full-stack application showcasing modern web development with intelligent route generation.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991)](https://openai.com/)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-APIs-4285F4)](https://developers.google.com/maps)
[![Tests](https://img.shields.io/badge/tests-199%20passing-success)](/)

A sophisticated web application that combines AI, real-time mapping, and intelligent route planning to create personalized dog walking experiences. Features custom route generation powered by OpenAI GPT-4o-mini, integrated with Google Maps APIs for real-world navigation.

## 🎯 What Makes This Special

This isn't just another CRUD app—it's a **demonstration of modern AI engineering** and full-stack expertise:

✨ **Multi-API Orchestration** - Seamlessly integrates 4 external APIs (OpenAI, Google Geocoding, Places, Directions) in a single user flow

🤖 **Cost-Conscious AI** - Implements GPT-4o-mini with feature flags and budget controls to keep costs under $2/month while maintaining quality

🗺️ **Real-Time Route Visualization** - Decodes polylines and renders walking routes with waypoint markers on interactive maps

⚡ **Optimistic UI** - Instant feedback using React's `useOptimistic` hook with automatic rollback on failures

🧪 **Test-Driven Development** - 199 passing tests written before implementation, showcasing professional development practices

🔒 **Security-First Architecture** - Row-Level Security policies, server-side authentication, SQL injection protection by design

## 🚀 Key Features

### AI-Powered Route Generation
- **Custom Route Planning** - Generate circular walking routes based on distance preferences (1-10km)
- **Intelligent Waypoint Selection** - AI chooses optimal POIs (parks, cafes, dog parks) based on user preferences
- **Turn-by-Turn Directions** - Real walking directions with distance and duration calculations
- **Interactive Maps** - Visual route display with polylines and numbered waypoint markers

### Core Functionality
- 🔐 **Secure Authentication** - Email/password with Supabase Auth and Row-Level Security
- ✏️ **Full CRUD Operations** - Create, read, update, delete walks with optimistic UI updates
- 🔍 **Advanced Filtering** - Search by name, difficulty, distance with URL-based state management
- 📱 **Fully Responsive** - Mobile-first design with accessible keyboard navigation
- ⚡ **Real-Time Feedback** - Toast notifications and loading states for all async operations

### Technical Highlights
- **Server Components** - Leverages React Server Components for optimal performance
- **Server Actions** - Type-safe client-server communication without API routes
- **Debounced Search** - Performance-optimized filtering with 300ms debounce
- **Form Validation** - Client and server-side validation with user-friendly error messages
- **Database Policies** - PostgreSQL RLS ensures data isolation at the database level

## 🏗️ Architecture & Technical Decisions

### AI Integration Strategy
```
User Input → Geocoding API → Places API → OpenAI GPT-4o-mini → Directions API → Map Display
```

**Why GPT-4o-mini?**
- 15x cheaper than GPT-4o ($0.15 vs $2.50 per 1M tokens)
- Sufficient intelligence for structured waypoint selection
- ~$0.04 per route generation with full API orchestration

**Cost Protection Measures:**
- Feature flags for emergency disable (`AI_RECOMMENDATIONS_ENABLED`)
- Hard budget limits on OpenAI account
- Future: Rate limiting and caching (planned)

### React Patterns Demonstrated

**Server Components:**
```typescript
// Server Component - data fetching at build/request time
export default async function WalksPage() {
  const walks = await getWalks() // Runs on server
  return <WalksList walks={walks} />
}
```

**Optimistic Updates:**
```typescript
// Client Component - instant UI feedback
const [optimisticWalks, deleteOptimistic] = useOptimistic(walks)
const [isPending, startTransition] = useTransition()

function handleDelete(id) {
  startTransition(async () => {
    deleteOptimistic(id) // UI updates instantly
    await deleteWalkAction(id) // Server action
    // Auto-reverts on error
  })
}
```

**Server Actions:**
```typescript
'use server'
export async function generateCustomRoute(location, preferences) {
  // Authentication check
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Multi-API orchestration
  const coords = await geocodeLocation(location)
  const pois = await findNearbyPOIs(coords)
  const route = await aiSelectWaypoints(pois, preferences)
  return route
}
```

## 🛠️ Tech Stack

### Core Technologies
| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | React framework with Server Components |
| **Language** | TypeScript (strict mode) | Type safety and developer experience |
| **Database** | PostgreSQL (Supabase) | Relational database with RLS policies |
| **Authentication** | Supabase Auth | Secure user authentication |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Testing** | Vitest + React Testing Library | Unit and integration testing |

### AI & External APIs
| API | Usage | Cost |
|-----|-------|------|
| **OpenAI GPT-4o-mini** | Intelligent waypoint selection | $0.15/$0.60 per 1M tokens |
| **Google Geocoding API** | Location text → coordinates | Free (40k/month) |
| **Google Places API** | Find nearby POIs | $0.032 per search |
| **Google Directions API** | Calculate walking routes | $0.005 per request |
| **Google Maps JavaScript** | Visual map display | Free (28k loads/month) |

**Total cost per custom route:** ~$0.04 (with all APIs)

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or pnpm
Supabase account (free tier works)
OpenAI API key
Google Cloud account (Maps APIs enabled)
```

### Quick Start

1. **Clone and install:**
```bash
git clone https://github.com/SamOllason/woof-woof-walkies.git
cd woof-woof-walkies
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Configure `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI & Maps
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...  # For client-side map display
AI_RECOMMENDATIONS_ENABLED=true
```

3. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

4. **Run tests:**
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Database Setup

The project uses Supabase with Row-Level Security policies. Schema is created automatically via Supabase dashboard SQL editor. See `documentation/specification.md` for database schema details.

### API Setup

**OpenAI:**
1. Sign up at https://platform.openai.com
2. Create API key
3. Set spending limits ($10/month recommended for portfolio)

**Google Maps:**
1. Enable APIs: Geocoding, Places, Directions, Maps JavaScript
2. Create API key
3. Restrict key to your domain for production

**Estimated monthly costs (portfolio usage):**
- OpenAI: $0.50 - $2.00
- Google Maps: $0.00 (free tier sufficient)
- **Total: < $2.50/month**

## � Deployment

This project is designed for zero-config deployment on Vercel:

1. Push your code to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - `AI_RECOMMENDATIONS_ENABLED`
4. Deploy

Vercel auto-detects Next.js configuration and enables automatic deployments on every push.

## �📚 Documentation

- [Project Specification](./documentation/specification.md) - Detailed requirements and technical decisions
- [Development Roadmap](./documentation/roadmap.md) - Feature progress and planning
- [Architecture Diagrams](./documentation/architecture/) - Component architecture and data flow
- [GitHub Copilot Instructions](./.github/copilot-instructions.md) - Development guidelines and patterns

## 🎓 Skills Demonstrated

This project showcases production-ready development practices:

### AI Engineering
- **Prompt Engineering** - Structured JSON output from GPT-4o-mini for reliable parsing
- **Multi-API Orchestration** - Coordinating 4 external APIs in a single user flow
- **Cost Optimization** - Model selection, budget controls, feature flags
- **Error Handling** - Graceful degradation when AI services are unavailable
- **Feature Flags** - Production safety with instant disable capability

### Modern React Expertise
- **Server Components** - Data fetching and rendering on the server
- **Client Components** - Interactive UI with `'use client'` directive
- **Server Actions** - Type-safe mutations without REST API routes
- **useOptimistic Hook** - Instant UI feedback with automatic rollback
- **useTransition** - Non-blocking state updates with pending states

### Full-Stack Development
- **Database Design** - PostgreSQL schema with foreign keys and triggers
- **Row-Level Security** - Database-level authorization policies
- **Server-Side Auth** - Secure authentication checks in Server Components/Actions
- **Real-Time Features** - Optimistic updates and live feedback
- **URL State Management** - Shareable filter states via search params

### Professional Practices
- **Test-Driven Development** - 199 tests written before implementation
- **Accessibility** - WCAG AA compliance, semantic HTML, keyboard navigation
- **TypeScript Strict Mode** - Full type safety with no `any` types
- **Security First** - SQL injection protection, XSS prevention, RLS policies
- **Documentation** - Architecture diagrams, specification, development guides
- **Git Workflow** - Semantic commits, feature branches, meaningful history

## 📝 License

MIT

## 👤 Author

**Sam Ollason**
- GitHub: [@SamOllason](https://github.com/SamOllason)

---

*Built with ❤️ as a portfolio and learning project*
