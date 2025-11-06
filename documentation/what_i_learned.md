# What I've Learned

A running log of concepts, patterns, and technologies learned while building Woof Woof Walkies.

---

## Session 1: Form Component with Supabase Integration (Nov 6, 2025)

### ✅ Completed
- Built "Add a Walk" form with validation
- Connected form to Supabase database
- Set up testing infrastructure
- Successfully saved data to PostgreSQL

---

## React & Next.js Concepts

### Server Components vs Client Components
**Key Learning:** Not all React components are the same in Next.js 13+

- **Server Components (default):** Run on server, no `'use client'` needed
  - Can fetch data directly
  - Can't use hooks (`useState`, `useEffect`)
  - Can't handle browser events
  - Less JavaScript sent to browser

- **Client Components:** Marked with `'use client'`
  - Can use React hooks
  - Can handle user interactions (`onClick`, `onChange`)
  - Run in the browser
  - Need this for forms, interactive UI

**Pattern Used:**
```tsx
// Server Component (page.tsx)
export default function Page() {
  const serverAction = async () => { 'use server' }
  return <ClientForm onSubmit={serverAction} />
}

// Client Component (AddWalkForm.tsx)
'use client'
export default function ClientForm({ onSubmit }) {
  const [state, setState] = useState()
  // Interactive logic
}
```

### Server Actions
**Key Learning:** Functions that run on the server but can be called from client components

- Marked with `'use server'` directive
- Automatically exposed as API endpoints by Next.js
- No need to create separate API routes
- Type-safe end-to-end with TypeScript

**Benefits:**
- Co-located with components
- Less boilerplate than traditional API routes
- Automatic serialization

**When to use:**
- Form submissions
- Database mutations
- Server-side operations from client components

### Controlled Components
**Key Learning:** React controls the input value via state

```tsx
const [value, setValue] = useState('')

<input 
  value={value}           // ← React controls this
  onChange={(e) => setValue(e.target.value)}
/>
```

**Why?**
- Single source of truth (React state)
- Can validate on every keystroke
- Can programmatically set values
- Easier to test

### Fast Refresh / Hot Reload
**Key Learning:** Next.js (Turbopack) updates code in browser instantly

- Changes appear in ~100ms without page refresh
- Component state is preserved
- CSS/Tailwind updates instantly
- Only recompiles changed files

**When state is reset:**
- Syntax errors
- Component renamed
- Error boundaries triggered

---

## TypeScript Patterns

### Interface vs Type
**Pattern Used:**
```typescript
// Full walk object (from database)
interface Walk {
  id: string
  user_id: string
  name: string
  distance_km: number
  // ... with timestamps
}

// Form input (subset - what user provides)
interface CreateWalkInput {
  name: string
  distance_km: number
  // ... no id or timestamps
}
```

**Key Learning:** Create separate types for different use cases
- `Walk` = complete database record
- `CreateWalkInput` = just what user provides
- Prevents accidentally passing wrong shape of data

### Type-Safe Literals
```typescript
type DifficultyLevel = 'easy' | 'moderate' | 'hard'
```
- Prevents typos
- Autocomplete in IDE
- Compile-time safety

---

## Testing with Vitest & React Testing Library

### Philosophy: Test User Behavior, Not Implementation
**Key Learning:** Test what users see and do, not internal state

✅ **DO Test:**
- "Can user type in the field?"
- "Does error show when form is invalid?"
- "Is the button disabled while submitting?"

❌ **DON'T Test:**
- Internal state values
- Function names
- CSS classes (unless testing visibility)

### Query Hierarchy (Best Practices)
```typescript
// 1. ✅ BEST: Query by role/label (how users/screen readers find elements)
screen.getByRole('button', { name: /save walk/i })
screen.getByLabelText(/walk name/i)

// 2. ⚠️ OKAY: Query by placeholder/text
screen.getByPlaceholderText(/riverside/i)

// 3. ❌ AVOID: Test IDs
screen.getByTestId('submit-button')
```

### User Events (Async!)
```typescript
const user = userEvent.setup()

// ✅ Always await user interactions
await user.type(input, 'text')
await user.click(button)

// ✅ Use waitFor for async assertions
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled()
})
```

**Why async?** User events simulate real user behavior with proper timing

### Test Structure (AAA Pattern)
```typescript
it('description', async () => {
  // ARRANGE: Set up test
  const mockFn = vi.fn()
  render(<Component onSubmit={mockFn} />)
  
  // ACT: Do something
  await user.type(input, 'text')
  await user.click(button)
  
  // ASSERT: Check result
  expect(mockFn).toHaveBeenCalled()
})
```

### Our Test Coverage
- ✅ 20 tests passing
- Rendering tests
- User input tests
- Validation tests
- Form submission tests
- Loading state tests
- Accessibility tests

---

## Supabase & PostgreSQL

### Database Table Creation
**Key Learning:** Tables define structure, constraints ensure data integrity

```sql
CREATE TABLE walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  distance_km NUMERIC(5, 2) CHECK (distance_km > 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Components:**
- `PRIMARY KEY`: Unique identifier for each row
- `DEFAULT`: Auto-generate values
- `NOT NULL`: Required fields
- `CHECK`: Validation constraints
- `TIMESTAMPTZ`: Timestamp with timezone

### Foreign Keys & Constraints
**Key Learning:** Foreign keys enforce relationships between tables

```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^
            This is the foreign key!
```

**What it means:**
- `user_id` must be a valid `id` from `auth.users` table
- OR null (if we allow it)
- Protects data integrity

**ON DELETE CASCADE:**
- When user is deleted → automatically delete all their walks
- Prevents orphaned data

**Other options:**
- `ON DELETE SET NULL`: Set user_id to null when user deleted
- `ON DELETE RESTRICT`: Prevent deletion if walks exist
- `ON DELETE NO ACTION`: Same as RESTRICT

**Error we hit:**
```
violates foreign key constraint "walks_user_id_fkey"
```
- Tried to insert user_id that doesn't exist
- Solved by allowing NULL temporarily (no auth yet)

### Row-Level Security (RLS)
**Key Learning:** Database-level permission system

```sql
-- Enable RLS
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own walks
CREATE POLICY "Users can view their own walks"
  ON walks
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Benefits:**
- Security enforced at database level
- Can't bypass with buggy code
- Automatic filtering

**Temporarily disabled** for testing (no auth yet)

### Triggers & Functions
**Key Learning:** Automate database behavior with triggers

**The Problem:** Want `updated_at` to auto-update when walk is edited

**The Solution:**
```sql
-- 1. Create function
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();  -- Set updated_at to current time
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger
CREATE TRIGGER update_walks_updated_at
  BEFORE UPDATE ON walks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**How it works:**
1. User updates a walk
2. BEFORE database saves it, trigger fires
3. Function sets `NEW.updated_at = NOW()`
4. Database saves the modified row

**Key concepts:**
- `NEW`: The row AFTER the change
- `OLD`: The row BEFORE the change
- `BEFORE UPDATE`: Timing (before save)
- `FOR EACH ROW`: Run once per row affected

**Analogy:** Like JavaScript event listeners for the database

### Supabase Client Setup
**Two clients for different contexts:**

```typescript
// Client-side (browser)
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(url, key)
}

// Server-side (Server Components/Actions)
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
export async function createClient() {
  // Handles cookies for auth
  return createServerClient(url, key, { cookies })
}
```

**Why two?**
- Browser client: For Client Components
- Server client: For Server Components/Actions, handles auth cookies

---

## Tailwind CSS

### Utility-First Approach
**Key Learning:** Style with pre-built utility classes

```tsx
className="w-full px-4 py-2 border rounded-lg"
           ^      ^    ^    ^      ^
           width  padding  border  rounded corners
```

**Benefits:**
- Fast to write
- No CSS file switching
- Consistent design
- Small bundle size (only used classes)

### Responsive Design
```tsx
className="px-4 sm:px-6 lg:px-8"
           ^     ^        ^
           mobile tablet  desktop
```

### State Variants
```tsx
className="hover:bg-blue-700 focus:ring-2 disabled:opacity-50"
```

### Accessibility: Placeholder & Text Contrast
**Problem:** Default placeholder text too light (poor accessibility)

```tsx
// ❌ Before: Light gray placeholder, light gray text
className="..."

// ✅ After: Medium gray placeholder, dark text
className="placeholder:text-gray-500 text-gray-900"
           ^^^^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^
           Placeholder color          Input text color
```

**Tailwind modifier syntax:**
- `placeholder:` targets placeholder text
- `hover:` targets hover state
- `focus:` targets focused state
- `disabled:` targets disabled state

---

## Form Validation Patterns

### Client-Side Validation
**Pattern:** Validate on submit, clear errors on change

```typescript
const validateForm = () => {
  const errors = {}
  
  if (!name.trim()) {
    errors.name = 'Walk name is required'
  }
  
  if (distance <= 0) {
    errors.distance = 'Distance must be greater than 0'
  }
  
  setErrors(errors)
  return Object.keys(errors).length === 0
}

const handleSubmit = async (e) => {
  e.preventDefault()
  
  if (!validateForm()) {
    return  // Stop if invalid
  }
  
  await onSubmit(formData)
}

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }))
  
  // Clear error when user starts typing
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }
}
```

**UX Benefits:**
- Don't annoy user with errors while typing
- Show errors after submit attempt
- Clear errors immediately when user fixes them

### Accessibility in Forms
**Key Learning:** Make forms usable by everyone

```tsx
<label htmlFor="name">Walk Name *</label>
<input 
  id="name"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
{errors.name && (
  <p id="name-error">{errors.name}</p>
)}
```

**Why?**
- Screen readers announce label
- `aria-invalid` tells screen reader field has error
- `aria-describedby` links to error message
- Screen reader reads error automatically

---

## Git & GitHub

### Basic Workflow
```bash
git init                          # Initialize repo
git add .                         # Stage all files
git commit -m "message"           # Commit changes
git remote add origin <url>       # Link to GitHub
git push -u origin main           # Push and set upstream
```

### Understanding `-u` Flag
```bash
git push -u origin main
         ^
         --set-upstream
```

**What it does:** Sets up tracking relationship

**First time:**
```bash
git push -u origin main  # Set tracking
```

**Every time after:**
```bash
git push  # Just this! Git knows where to push
```

### Merge Conflicts in VS Code
**Visual resolution:**
- Click "Accept Current Change" for local version
- Click "Accept Incoming Change" for remote version
- Click "Accept Both Changes" to keep both

**After resolving:**
```bash
git add .
git rebase --continue
```

---

## YAGNI Principle

**"You Aren't Gonna Need It"**

**Key Learning:** Don't add complexity until you need it

### What We DIDN'T Use (On Purpose):
- ❌ React Hook Form (form library)
- ❌ Zod (validation library)
- ❌ TanStack Query (data fetching library)
- ❌ Zustand/Redux (state management)

**Why not?**
- Form is simple (5 fields)
- Validation is straightforward
- Plain React works fine
- Learn fundamentals first

**When to add them?**
- Form has 10+ fields
- Complex validation rules
- Performance issues
- Team preference for patterns

**Benefit of waiting:**
- Understand the problem first
- Appreciate what libraries solve
- Smaller bundle size
- Less to learn upfront

---

## Environment Variables

### Next.js Convention
```bash
# .env.local (gitignored!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
```

**Key Points:**
- `NEXT_PUBLIC_` prefix = available in browser
- Without prefix = server-only
- `.env.local` is gitignored (never commit secrets!)
- Restart dev server after changing

---

## Development Workflow

### Feature-First Development
**Approach:** Build one complete feature at a time

**Our process:**
1. Pick user story ("Add a walk")
2. Design UI (form component)
3. Create types (TypeScript interfaces)
4. Build component (with validation)
5. Write tests (20 tests)
6. Connect to backend (Supabase)
7. Test end-to-end

**Benefits:**
- Always have something working
- Learn in context
- Easy to demonstrate progress

---

## Key Takeaways

### 1. **Test User Behavior**
Don't test implementation details. Test what users see and do.

### 2. **Keep Client Components Minimal**
Use `'use client'` only where needed. Server Components by default.

### 3. **Types Are Documentation**
Good TypeScript types prevent bugs and document intent.

### 4. **Database Constraints Are Safety Nets**
Foreign keys, NOT NULL, CHECK constraints = data integrity at database level.

### 5. **Accessibility Isn't Optional**
Use semantic HTML, ARIA attributes, good contrast. Everyone benefits.

### 6. **Start Simple, Add Complexity When Needed**
YAGNI: Plain React works great before reaching for libraries.

---

## What's Next to Learn

- [ ] Authentication (Supabase Auth)
- [ ] Listing data from database
- [ ] Pagination
- [ ] Search and filtering
- [ ] Update and delete operations
- [ ] Real-time subscriptions
- [ ] File uploads
- [ ] Deployment to Vercel

---

_Updated: November 6, 2025_
