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

---

## 🎯 Priority Roadmap

### Phase 3: Authentication (HIGHEST PRIORITY) 🔐
**Goal:** Enable multi-user functionality with secure authentication  
**Time estimate:** 2-3 hours  
**Employability impact:** ⭐⭐⭐⭐⭐

**Features:**
- [ ] Sign up page with email/password
- [ ] Login page
- [ ] Logout functionality
- [ ] Protected routes (middleware)
- [ ] Server-side session checking
- [ ] Update walks table to require user_id
- [ ] Enable Row-Level Security (RLS) policies
- [ ] User can only see/edit their own walks
- [ ] Tests for auth flow

**Why this matters:**
- Authentication is required in virtually every real-world app
- Shows you understand security fundamentals
- Protected routes are a common interview topic
- RLS demonstrates database security knowledge
- Every employer wants to see auth experience

**Skills learned:**
- Supabase Auth API
- Next.js middleware
- Server-side session management
- Cookie handling
- Database security policies
- Protected route patterns

---

### Phase 4: Edit & Delete Walks (Complete CRUD) ✏️
**Goal:** Full CRUD operations (Create, Read, Update, Delete)  
**Time estimate:** 1-2 hours  
**Employability impact:** ⭐⭐⭐⭐

**Features:**
- [ ] Edit button on each WalkCard
- [ ] Edit walk page (form pre-populated)
- [ ] Update Server Action
- [ ] Delete button with confirmation dialog
- [ ] Delete Server Action
- [ ] Optimistic UI updates (update UI before server responds)
- [ ] Success/error toast notifications
- [ ] Tests for edit/delete flows

**Why this matters:**
- CRUD is fundamental to all applications
- Shows you understand the full data lifecycle
- Optimistic updates demonstrate advanced UX patterns
- Form state management is a key skill

**Skills learned:**
- UPDATE and DELETE SQL operations
- Form pre-population techniques
- Confirmation dialogs
- Optimistic UI patterns
- Error handling and rollback
- Toast notifications

---

### Phase 5: Search & Filter 🔍
**Goal:** Advanced data filtering with good UX  
**Time estimate:** 2 hours  
**Employability impact:** ⭐⭐⭐⭐

**Features:**
- [ ] Search input (by walk name)
- [ ] Filter by difficulty (easy/moderate/hard)
- [ ] Filter by distance range
- [ ] Debounced search (don't search on every keystroke)
- [ ] URL search params (shareable filtered links)
- [ ] Server-side filtering with Supabase queries
- [ ] "Clear filters" button
- [ ] Filter result count display
- [ ] Tests for filtering logic

**Why this matters:**
- Search/filter is in most applications
- Shows you understand UX (debouncing, URL state)
- Demonstrates performance considerations
- URL state management is a valuable pattern

**Skills learned:**
- Debouncing techniques
- URL search params in Next.js
- Server-side filtering with SQL
- Multiple filter combination logic
- React state management patterns
- Performance optimization

---

## 🚀 Nice-to-Have Features (After Core Features)

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
