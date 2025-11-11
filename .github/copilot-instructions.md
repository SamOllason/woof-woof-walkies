# GitHub Copilot Instructions for Woof Woof Walkies

## Project Context
This is a **learning-focused portfolio project** for a senior software engineer returning to modern full-stack development with React, TypeScript, Next.js 15, and PostgreSQL (Supabase).

## Core Development Principles

### 1. Test-Driven Development (TDD)
**Always use TDD unless explicitly asked not to.**

- Write failing tests first
- Implement minimum code to pass
- Refactor with confidence
- Aim for comprehensive test coverage
- Test behavior, not implementation details
- Use Vitest + React Testing Library

**Example workflow:**
1. Write test describing desired behavior
2. Run test (should fail)
3. Write implementation
4. Run test (should pass)
5. Refactor if needed

### 2. Accessibility First
**Build with accessibility as a primary concern, not an afterthought.**

- Use semantic HTML elements (`<nav>`, `<main>`, `<button>`, etc.)
- Ensure all interactive elements are keyboard accessible
- Provide proper ARIA labels where needed
- Maintain sufficient color contrast (WCAG AA minimum)
- Test with keyboard navigation
- Ensure form inputs have associated labels

**Examples:**
- Use `<button>` not `<div onClick>`
- Always pair `<label>` with form inputs using `htmlFor`
- Use `aria-label` for icon-only buttons
- Ensure focus states are visible

### 3. Code Comments & Learning Notes
**Add comments for non-obvious code, nuanced patterns, or key learning points.**

This is a learning project - comments should help future understanding:

```typescript
// GOOD: Explains why/what the learning point is
// Using useOptimistic hook for instant UI updates while server request happens in background.
// This provides better perceived performance. Will auto-revert on error.
const [optimisticWalks, removeOptimisticWalk] = useOptimistic(...)

// BAD: States the obvious
// Set the walk name
setWalkName(name)
```

**When to add comments:**
- Complex React patterns (useOptimistic, useTransition, Server Actions)
- Non-obvious architectural decisions
- Performance optimizations
- Security considerations (RLS policies, auth checks)
- Gotchas or edge cases
- Next.js specific patterns (Server vs Client Components)

### 4. Design System Consistency
**Always use the established design patterns from existing components.**

**Color Palette:**
- Primary action: `bg-blue-600 hover:bg-blue-700`
- Destructive action: `text-red-600 hover:text-red-700`
- Text primary: `text-gray-900`
- Text secondary: `text-gray-600`
- Borders: `border-gray-300`
- Backgrounds: `bg-white`, `bg-gray-50`

**Input Styling (Standard Pattern):**
```typescript
className="w-full px-4 py-2 border border-gray-300 rounded-lg 
  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
  placeholder:text-gray-500 text-gray-900"
```

**Button Styling:**
- Primary: `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700`
- Secondary: `text-blue-600 hover:text-blue-700 underline`
- Destructive: `text-red-600 hover:text-red-700`

**Spacing:**
- Use Tailwind spacing scale consistently
- Cards: `p-6` for padding
- Gaps: `space-y-4` or `gap-4`
- Margins: `mb-4`, `mt-8`, etc.

### 5. Architecture Documentation
**Create architecture diagrams before implementing large features.**

**When to create diagrams:**
- New major features (search/filter, file upload, etc.)
- Complex data flows
- Client/Server component boundaries
- Authentication flows
- State management patterns

**Diagram format:**
```
┌─────────────────────────┐
│   Component/Layer        │
│   - Key responsibility   │
│   - Important detail     │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│   Next Layer            │
└─────────────────────────┘
```

**Store in:** `documentation/architecture/[feature-name].md`

### 6. File Organization Patterns

**Component Structure:**
```
src/
  components/
    ComponentName.tsx          # Component implementation
    __tests__/
      ComponentName.test.tsx   # Tests (comprehensive)
```

**Page Structure (Next.js App Router):**
```
src/app/
  (app)/                      # Authenticated app routes
    page.tsx                  # Server Component
    actions.ts                # Server Actions
  (auth)/                     # Unauthenticated routes
    login/
    signup/
```

**Documentation:**
```
documentation/
  specification.md            # Project requirements & tech stack
  roadmap.md                 # Feature roadmap with progress
  architecture/              # Architecture diagrams per feature
    [feature-name].md
```

## Technology-Specific Guidelines

### Next.js 15 App Router
- **Default to Server Components** - only use Client Components when needed
- Mark Client Components with `'use client'` directive
- Server Actions use `'use server'` directive
- Accept `searchParams` as async Promise in page components
- Use `revalidatePath()` after mutations

**Server vs Client Component Decision:**
- **Server:** Data fetching, rendering static content
- **Client:** Interactivity, hooks (useState, useEffect), event handlers

### TypeScript
- Use strict mode
- Define types for all props and function parameters
- Use interfaces for component props
- Use types for data models (imported from `@/types`)
- No `any` types unless absolutely necessary

### Supabase
- Always use RLS (Row-Level Security) policies
- Server-side auth checks in Server Components/Actions
- Use TypeScript types generated from database schema
- Use `.from('table').select('*')` pattern for queries
- Chain filters: `.eq()`, `.ilike()`, `.gte()`, `.lte()`

### Testing
- Test files: `ComponentName.test.tsx`
- Mock external dependencies (Next.js navigation, Supabase, etc.)
- Test user interactions with `@testing-library/user-event`
- Use `screen` queries from `@testing-library/react`
- Clean up mocks in `afterEach` hooks
- Use `vi.useFakeTimers()` for debounce/throttle testing

## Common Patterns to Follow

### Form Handling
```typescript
// Server Action pattern
'use server'
export async function submitFormAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // Process form...
  
  revalidatePath('/target-page')
  redirect('/success-page')
}
```

### Optimistic UI Updates
```typescript
const [walks, setWalks] = useState(initialWalks)
const [optimisticWalks, updateOptimistic] = useOptimistic(
  walks,
  (currentWalks, walkToUpdate) => {
    // Return optimistic state
  }
)
const [isPending, startTransition] = useTransition()

async function handleAction() {
  startTransition(async () => {
    updateOptimistic(/* optimistic update */)
    try {
      await serverAction()
      setWalks(/* new state */)
      toast.success('Success!')
    } catch (error) {
      toast.error('Failed. Please try again.')
    }
  })
}
```

### Debouncing
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    performAction(value)
  }, 300)
  
  return () => clearTimeout(timer)
}, [value])
```

## Portfolio-Worthy Feature Checklist

When implementing features that showcase expertise:

- [ ] Comprehensive test coverage (95%+)
- [ ] Architecture diagram created
- [ ] Comments explaining key learning points
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Mobile-responsive design
- [ ] Error handling with user-friendly messages
- [ ] Loading states where appropriate
- [ ] TypeScript types properly defined
- [ ] Follows established design system
- [ ] Documented in `specification.md` if appropriate

## Questions to Ask Before Implementation

1. **Is this accessible?** Can keyboard-only users interact with it?
2. **Should I write tests first?** (Default: Yes, unless told otherwise)
3. **Is this a Server or Client Component?** (Default: Server unless interactive)
4. **Does this need an architecture diagram?** (Yes if complex/multi-layer)
5. **Are there non-obvious patterns that need comments?** (Learning opportunities?)
6. **Does this match the design system?** (Colors, spacing, typography)
7. **What error states need handling?** (Network failures, validation, etc.)
8. **Is this mobile-responsive?** (Test with Tailwind breakpoints)

## Remember

This project is about **learning and demonstrating expertise**, not just shipping features. Take time to:

- Understand *why* patterns work, not just *how*
- Write code you'd be proud to show in an interview
- Document your learning journey
- Build features that showcase modern best practices
- Prioritize code quality over speed

---

*Last updated: November 11, 2025*
