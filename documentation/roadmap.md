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

---

## 🎯 Priority Roadmap

### Phase 6: File Upload (Walk Photos) 📸
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

### Phase 7: Loading States & Error Handling 🎨
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

### Phase 8: Pagination / Infinite Scroll 📜
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

### Phase 9: Dark Mode 🌙
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

### Phase 10: Advanced Features (Polish)

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

### Phase 11: Database Migration Management (Production Best Practice) 🔧
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

**Phases 6-10:**
- File handling
- Loading states
- Scalability
- UX polish

---

## 💼 Resume Talking Points (After Completion)

After completing Phases 3-5, you can say:

> **"Built a full-stack dog walking tracker with Next.js 15, React Server Components, TypeScript, and Supabase."**
>
> **Technical highlights:**
> - Implemented secure authentication with Row-Level Security policies
> - Full CRUD operations with optimistic UI updates for better UX
> - Advanced search and filtering with debounced inputs and URL state management
> - Test-driven development with Vitest and React Testing Library (30+ tests)
> - Server-side rendering with React Server Components for optimal performance
> - Server Actions for type-safe client-server communication
> - Responsive design with Tailwind CSS

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
