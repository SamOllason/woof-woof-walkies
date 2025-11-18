# Project Roadmap

Development plan for Woof Woof Walkies - prioritized by learning value and employability skills.

---

## ✅ Completed Features

### Phase 0: Project Setup
- [x] Next.js 15 project with TypeScript
- [x] Tailwind CSS v4 configured
- [x] Vitest testing infrastructure
- [x] Supabase project created and connected
- [x] Database schema (walks table with triggers)
- [x] Git repository initialized and pushed to GitHub

### Phase 1: Add Walk Feature
- [x] TypeScript types (Walk, CreateWalkInput, DifficultyLevel)
- [x] AddWalkForm component (Client Component)
- [x] Form validation
- [x] Server Action for saving walks
- [x] 20 passing tests for AddWalkForm
- [x] Successfully saving to Supabase

### Phase 2: List Walks Feature
- [x] Homepage replaced with walks list
- [x] WalkCard component (Server Component)
- [x] Server-side data fetching from Supabase
- [x] Empty state ("No walks yet")
- [x] Error state handling
- [x] 11 passing tests for WalkCard
- [x] Component architecture diagrams

### Phase 3: Authentication
- [x] Sign up page with email/password
- [x] Login page
- [x] Logout functionality (Header with LogoutButton)
- [x] Protected routes (middleware)
- [x] Server-side session checking
- [x] Update walks table to use real user_id
- [x] Enable Row-Level Security (RLS) policies (all 4 CRUD policies)
- [x] User can only see/edit their own walks
- [x] Tests for auth flow (42 tests passing)
- [x] Responsive Header component with mobile menu
- [x] Route groups for authenticated vs auth pages

### Phase 4: Edit & Delete Walks (Complete CRUD)
- [x] Edit button on each WalkCard
- [x] Delete button on each WalkCard
- [x] Edit walk page with pre-populated form
- [x] Update Server Action with redirect handling
- [x] EditWalkForm component (14 tests)
- [x] Delete confirmation dialog
- [x] Delete Server Action in separate actions file
- [x] **Optimistic UI updates with React's useOptimistic hook**
- [x] **WalksList client component for optimistic state management**
- [x] **Success/error toast notifications (react-hot-toast)**
- [x] **Visual pending states during delete operations**
- [x] **Automatic rollback on server errors**
- [x] Comprehensive tests for optimistic behavior (130+ tests passing)
- [x] Documented as portfolio-worthy feature in specification

### Phase 5: Search & Filter
- [x] SearchFilters client component with debounced search input
- [x] Filter by walk name (case-insensitive search)
- [x] Filter by difficulty (dropdown)
- [x] Filter by distance range (min/max inputs)
- [x] URL search params for shareable filter links
- [x] Server-side filtering with Supabase (.ilike, .eq, .gte, .lte)
- [x] Clear filters button
- [x] Result count display
- [x] Responsive filter layout
- [x] Comprehensive tests for filter behavior
- [x] Multiple filters combined in URL

### Phase 6: Deployment
- [x] Created `.env.example` for environment variable documentation
- [x] Added deployment section to README
- [x] Prepared for Vercel deployment (zero-config Next.js detection)
- [x] Documented deployment steps (GitHub integration recommended)

---

## 🎯 Priority Roadmap

### Phase 7: AI-Powered Walk Recommendations 🤖
**Time estimate:** 3-4 hours  
**Employability impact:** ⭐⭐⭐⭐⭐ (Highly differentiating!)

**Goal:** Allow users to discover new walking routes in their area using AI-powered personalized recommendations based on their walking history and nearby points of interest.

**AI Architecture Decisions:**
- **LLM Provider:** OpenAI GPT-4o-mini (cost-effective at $0.15/$0.60 per 1M tokens vs GPT-4o at $2.50/$10.00)
- **Location Service:** Google Maps API (Geocoding + Places)
- **Cost Protection:** Rate limiting (5 requests/hour/user), caching (24hr), hard budget limits ($10/month)
- **Fallback Strategy:** Feature flag for emergency disable, graceful degradation with message

**MVP Approach - Get It Working First:**
- [x] **Step 1: API Setup**
  - [x] Create OpenAI account and get API key
  - [x] Create Google Cloud account and enable Maps APIs (Geocoding)
  - [x] Add API keys to `.env.local` and `.env.example`
  - [x] Add `AI_RECOMMENDATIONS_ENABLED` feature flag
  - [x] Install dependencies: `openai`

- [x] **Step 2: Basic OpenAI Integration**
  - [x] Create utility: `generateWalkRecommendations()` - calls OpenAI API
  - [x] Simple prompt: "Suggest 3 dog walks near [location]"
  - [x] Use GPT-4o-mini model
  - [x] Return JSON response with structured data
  - [x] Basic error handling with user-friendly messages
  - [x] Lazy client initialization for proper env var loading

- [x] **Step 3: Simple UI - Recommendations Page**
  - [x] Create `/recommendations` page
  - [x] Simple text input for location
  - [x] "Get Recommendations" button
  - [x] Loading state with useTransition
  - [x] Display AI recommendations as cards (name, distance, difficulty, highlights, reason)
  - [x] Error messages with toast notifications
  - [x] Responsive design matching app design system

- [x] **Step 4: Server Action**
  - [x] `getRecommendationsAction(location: string)`
  - [x] Check feature flag
  - [x] Validate user authentication
  - [x] Call OpenAI utility
  - [x] Return recommendations
  - [x] Comprehensive error handling
  - [x] Deployed to Vercel production

**Next: Custom Route Generation (AI + Maps Integration):**
> See detailed architecture: `documentation/architecture/ai-route-generation.md`

- [ ] **Step 5: Google Maps APIs Setup**
  - [x] Enable Places API in Google Cloud Console
  - [x] Enable Directions API in Google Cloud Console
  - [ ] Verify API keys have necessary permissions

- [ ] **Step 6: Build Map Utilities**
  - [ ] Create `src/lib/maps/geocoding.ts` - Convert location text → coordinates
  - [ ] Create `src/lib/maps/places.ts` - Find nearby parks, cafes, trails
  - [ ] Create `src/lib/maps/directions.ts` - Generate walking routes from waypoints
  - [ ] Create `src/types/maps.ts` - TypeScript interfaces
  - [ ] Test utilities with real locations

- [ ] **Step 7: Enhance AI for Route Generation**
  - [ ] Update OpenAI prompt to generate waypoints (not just text)
  - [ ] Pass real POI data from Places API to AI
  - [ ] AI returns structured waypoints: `[{lat, lng, name}]`
  - [ ] Update `WalkRecommendation` type to include waypoints

- [ ] **Step 8: Integrate Full Flow**
  - [ ] Wire up: Geocoding → Places → OpenAI → Directions
  - [ ] Update recommendations page with route preferences:
    - Distance selector (1-10km)
    - Must-include POIs (cafe, dog park, etc.)
    - Circular route toggle
  - [ ] Display generated routes with directions

- [ ] **Step 9: Visual Map Display**
  - [ ] Create `src/components/RouteMap.tsx` 
  - [ ] Display route polyline on Google Map
  - [ ] Show waypoint markers (start, POIs, end)
  - [ ] Add distance/duration info
  - [ ] "Save as Walk" button

- [ ] **Step 10: Deploy & Test**
  - [ ] Deploy to Vercel
  - [ ] Test with multiple locations
  - [ ] Verify cost stays low (~$0.04/route)

**Add Later (Cost Control & Polish):**
- [ ] **Rate Limiting** (prevent cost overruns)
  - [ ] `ai_usage` table in Supabase
  - [ ] 5 requests/hour/user limit
  - [ ] Rate limit UI component

- [ ] **Caching** (reduce API calls)
  - [ ] `ai_recommendations_cache` table
  - [ ] 24-hour cache per location + preferences
  - [ ] Check cache before API calls

- [ ] **Advanced Features**
  - [ ] Weather-aware routing (shaded paths in summer)
  - [ ] Real-time crowd data
  - [ ] Terrain preferences (flat vs hilly)
  - [ ] Save favorite routes
  - [ ] Share routes via link

**Skills learned:**
- OpenAI API integration and prompt engineering
- Google Maps API (Geocoding, Places, Directions)
- Multi-API orchestration (Maps + AI working together)
- Cost management for AI services (rate limiting, caching, budget controls)
- LLM selection criteria (performance vs cost trade-offs)
- Feature flags for production safety
- Caching strategies for expensive operations
- User experience design for AI features (loading states, error handling)
- Custom route generation algorithms
- Waypoint-based navigation
- Interactive map components

**Key AI Decisions:**

1. **Model Selection: GPT-4o-mini over GPT-4o**
   - **Rationale:** 15x cheaper ($0.15 vs $2.50 per 1M input tokens) with minimal quality loss for recommendation tasks
   - **Trade-off:** Slightly less sophisticated reasoning, but sufficient for generating walk suggestions
   - **Impact:** Reduces costs from ~$0.015/request to ~$0.001/request

2. **Rate Limiting: 5 requests/hour/user**
   - **Rationale:** Prevents abuse while allowing legitimate exploration (5 different locations per hour is generous)
   - **Implementation:** Database-backed (auditable, persistent across server restarts)
   - **User Impact:** Minimal friction - most users won't hit limit

3. **Caching Strategy: 24-hour location-based cache**
   - **Rationale:** Same location searches return identical results (parks don't move!)
   - **Impact:** Reduces API calls by ~80% after initial usage
   - **Trade-off:** Recommendations don't update with real-time data (acceptable for this use case)

4. **Prompt Optimization:**
   - **Technique:** Concise instructions, structured output (JSON), minimal context
   - **Before:** ~500 tokens/request, After: ~100 tokens/request
   - **Impact:** 5x cost reduction per request

5. **Fallback Strategy: Feature flag + graceful degradation**
   - **Rationale:** Production safety - can disable instantly if costs spike or API issues occur
   - **Implementation:** Environment variable check + user-friendly message
   - **Business Impact:** Protects budget while maintaining app availability

**Cost Analysis:**
- Development/testing: ~$0.10 (20 requests with caching)
- Production (solo portfolio): ~$0.50-2/month (with rate limits + caching)
- Worst case (bug/abuse): $10/month (hard OpenAI limit prevents further charges)

---

### Phase 8: Monetization - Amazon Affiliate Integration 💰
**Time estimate:** 2-3 hours  
**Employability impact:** ⭐⭐⭐⭐ (Shows business acumen!)

**Goal:** Integrate Amazon Associates affiliate links for dog walking gear recommendations, demonstrating understanding of product monetization strategies.

**Features:**
- [ ] Sign up for Amazon Associates program
- [ ] Add recommended gear section to AI walk recommendations
- [ ] Context-aware product suggestions based on walk type:
  - Water bowls for long walks
  - Reflective gear for evening walks
  - Cooling vests for summer routes
  - Paw protection for rough terrain
- [ ] Affiliate link tracking with proper disclosure
- [ ] "Recommended Gear" component with product cards
- [ ] Analytics tracking for click-through rates

**Implementation:**
```typescript
interface RecommendedGear {
  name: string
  affiliateLink: string
  reason: string
  category: 'hydration' | 'safety' | 'comfort' | 'training'
}

// Enhance AI recommendations with gear suggestions
{
  walkRecommendation: {...},
  recommendedGear: [
    {
      name: "Collapsible Water Bowl",
      affiliateLink: "https://amzn.to/xyz",
      reason: "Perfect for water station stops on this 3km walk",
      category: "hydration"
    }
  ]
}
```

**Skills learned:**
- Affiliate marketing integration
- Product recommendation algorithms
- Monetization strategy implementation
- User experience with commercial features
- FTC disclosure compliance
- Analytics and conversion tracking

**Business Value:**
- Shows understanding of revenue generation
- Demonstrates product thinking beyond pure tech
- Real-world monetization experience
- Commission: ~4.5% on pet supplies (sustainable revenue model)

---

### Phase 9: File Upload (Walk Photos) 📸
**Time estimate:** 2-3 hours  
**Employability impact:** ⭐⭐⭐⭐

**Features:**
- [ ] Upload photos for each walk
- [ ] Image preview before upload
- [ ] File validation (type, size)
- [ ] Supabase Storage integration
- [ ] Image optimization with next/image
- [ ] Delete photos
- [ ] Multiple photos per walk

**Skills learned:**
- File upload handling
- Cloud storage (Supabase Storage)
- Image optimization
- File validation
- next/image best practices

---

### Phase 10: Loading States & Error Handling 🎨
**Time estimate:** 1-2 hours  
**Employability impact:** ⭐⭐⭐⭐

**Features:**
- [ ] Loading skeletons for walk cards
- [ ] Suspense boundaries
- [ ] Error boundaries
- [ ] Retry buttons on errors
- [ ] Toast notifications for actions
- [ ] Form submission loading states

**Skills learned:**
- React Suspense
- Error boundaries
- Loading UI patterns
- Progressive enhancement
- User feedback patterns

---

### Phase 11: Pagination / Infinite Scroll 📜
**Time estimate:** 2 hours  
**Employability impact:** ⭐⭐⭐

**Features:**
- [ ] Server-side pagination
- [ ] "Load more" button
- [ ] OR infinite scroll with intersection observer
- [ ] Page size controls
- [ ] Performance optimization for large datasets

**Skills learned:**
- Pagination techniques
- Intersection Observer API
- Performance at scale
- Offset/limit SQL queries

---

### Phase 12: Dark Mode 🌙
**Time estimate:** 30-60 minutes  
**Employability impact:** ⭐⭐

**Features:**
- [ ] Dark mode toggle
- [ ] Persist preference in localStorage
- [ ] Respect system preference
- [ ] Smooth theme transitions
- [ ] next-themes integration

**Skills learned:**
- CSS custom properties
- localStorage
- next-themes library
- System preference detection

---

### Phase 13: Advanced Features (Polish)

**Analytics Dashboard:**
- [ ] Total distance walked
- [ ] Total time spent
- [ ] Favorite routes
- [ ] Charts with Recharts

**Social Features:**
- [ ] Share walk with friends
- [ ] Public profile page
- [ ] Follow other walkers

**Maps Integration:**
- [ ] Map view of walk route
- [ ] GPS tracking (future mobile app)
- [ ] Location autocomplete

**Export/Import:**
- [ ] Export walks to CSV/JSON
- [ ] Import from other apps

---

### Phase 14: Database Migration Management (Production Best Practice) 🔧
**Goal:** Professional database change management  
**Time estimate:** 2-3 hours  
**Employability impact:** ⭐⭐⭐⭐

**Features:**
- [ ] Install and configure Supabase CLI
- [ ] Initialize local Supabase project
- [ ] Pull current schema to migration files
- [ ] Version control all database changes in Git
- [ ] Create migration files for future changes (instead of manual SQL)
- [ ] Set up CI/CD pipeline to run migrations
- [ ] Implement idempotent migrations (safe to run multiple times)
- [ ] Add rollback capabilities

**Why this matters:**
- Production apps NEVER run SQL manually in dashboards
- All database changes go through code review
- Changes are versioned and auditable
- Eliminates human error from manual SQL execution
- CI/CD can automatically apply migrations on deploy
- Critical for team collaboration

**Skills learned:**
- Supabase CLI
- Database migration tools (Flyway, Prisma Migrate alternatives)
- CI/CD for database changes
- GitHub Actions workflows
- Idempotent SQL patterns
- DevOps best practices

**Tools:**
- Supabase CLI
- GitHub Actions
- Migration versioning strategy

**Example workflow:**
```bash
# Create a new migration
npx supabase migration new add_feature

# Edit migration file in supabase/migrations/
# Commit to Git, open PR
# CI/CD runs migration on merge
```

---

## 📚 Learning Goals Per Phase

### Technical Skills Progression

**Phase 3 (Auth):**
- Security fundamentals
- Session management
- Middleware
- Database policies

**Phase 4 (CRUD):**
- Full data lifecycle
- State management
- Optimistic updates
- User feedback

**Phase 5 (Search/Filter):**
- Performance optimization
- URL state
- Debouncing
- Complex queries

**Phase 7 (AI Recommendations):**
- OpenAI API integration
- Multi-API orchestration
- Prompt engineering
- Cost management strategies
- Rate limiting & caching
- Feature flags
- Production safety patterns

**Phases 8-12:**
- File handling
- Loading states
- Scalability
- UX polish

---

## 💼 Technical Achievements Summary

After completing Phases 3-7:

**Project:** Full-stack dog walking tracker with AI-powered recommendations using Next.js 15, React Server Components, TypeScript, and Supabase.

**Technical highlights:**
- Implemented secure authentication with Row-Level Security policies
- Full CRUD operations with optimistic UI updates for better UX
- Advanced search and filtering with debounced inputs and URL state management
- AI-powered walk recommendations using OpenAI GPT-4o-mini and Google Maps API
- Multi-API orchestration (OpenAI + Google Maps) with cost controls
- Rate limiting and caching strategies to keep AI costs under $2/month
- Prompt engineering for efficient token usage (5x cost reduction)
- Test-driven development with Vitest and React Testing Library (130+ tests)
- Server-side rendering with React Server Components for optimal performance
- Server Actions for type-safe client-server communication
- Responsive design with Tailwind CSS

---

## 🎯 Recommended Order

1. **Authentication** (most valuable, unlocks everything else)
2. **Edit/Delete** (quick win, completes CRUD)
3. **Search/Filter** (impressive UX feature)
4. **Loading States** (polish existing features)
5. **File Upload** (visual appeal for demos)
6. **Pagination** (if you have lots of test data)
7. **Dark Mode** (quick polish)
8. **Advanced features** (as desired)

---

## 📝 Notes

- **YAGNI Principle:** Only build features when needed
- **TDD Approach:** Write tests first, then implementation
- **Documentation:** Update architecture diagrams for each feature
- **Git Commits:** Commit after each working feature
- **Learning Log:** Update `what_i_learned.md` with new concepts

---

## 🚀 Next Session

**Start with:** Phase 3 - Authentication

**Prepare by:**
- Reviewing Supabase Auth docs (optional)
- Thinking about sign up/login UX
- Ready to learn about middleware and RLS policies

---

_This roadmap prioritizes features that maximize learning and employability. Adjust based on your goals and available time!_



# Ideas

1. Using AI to recommend walks in local area, google maps integration?
2. Record walks using GPS? link to e.g. Strava?
3. Walk inspiration - things to see in local area based on location

