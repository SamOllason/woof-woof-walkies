# Component Architecture: List Walks Feature

Visual guide for the "View All Walks" feature.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  SERVER (Next.js)                                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  /walks/page.tsx (Server Component)                          │ │
│  │                                                               │ │
│  │  async function WalksPage() {                                │ │
│  │    // 1. Fetch data directly on server                       │ │
│  │    const supabase = await createClient()                     │ │
│  │    const { data: walks } = await supabase                    │ │
│  │      .from('walks')                                          │ │
│  │      .select('*')                                            │ │
│  │      .order('created_at', { ascending: false })              │ │
│  │                                                               │ │
│  │    // 2. Render with data (Server-Side Rendering)            │ │
│  │    return (                                                   │ │
│  │      <div>                                                    │ │
│  │        <h1>My Walks</h1>                                      │ │
│  │        {walks.map(walk => (                                  │ │
│  │          <WalkCard key={walk.id} walk={walk} />              │ │
│  │        ))}                                                    │ │
│  │      </div>                                                   │ │
│  │    )                                                          │ │
│  │  }                                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                         Sends HTML
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Rendered HTML with walk cards                               │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  WalkCard #1 (Client Component - optional)              │ │ │
│  │  │  'use client'                                           │ │ │
│  │  │                                                         │ │ │
│  │  │  📍 Riverside Loop                                      │ │ │
│  │  │  🏃 3.5 km • 45 min • Easy                             │ │ │
│  │  │  📝 Beautiful scenery                                   │ │ │
│  │  │                                                         │ │ │
│  │  │  [Edit] [Delete]  ← Interactive buttons                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  WalkCard #2                                            │ │ │
│  │  │  📍 Park Trail                                          │ │ │
│  │  │  🏃 2.0 km • 30 min • Easy                             │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
INITIAL PAGE LOAD
─────────────────

Step 1: Browser requests /walks
         ↓
Step 2: Server Component runs
┌─────────────────────────────────┐
│  page.tsx                       │
│  - Creates Supabase client      │
│  - Queries database             │
│  - Receives walks array         │
└────────────┬────────────────────┘
             ↓
Step 3: Database query
┌─────────────────────────────────┐
│  Supabase PostgreSQL            │
│  SELECT * FROM walks            │
│  ORDER BY created_at DESC       │
│  → Returns array of walks       │
└────────────┬────────────────────┘
             ↓
Step 4: Server renders HTML
┌─────────────────────────────────┐
│  - Maps over walks array        │
│  - Renders WalkCard for each    │
│  - Generates complete HTML      │
└────────────┬────────────────────┘
             ↓
Step 5: Browser receives HTML
┌─────────────────────────────────┐
│  - Shows walks immediately      │
│  - JavaScript hydrates          │
│  - Cards become interactive     │
└─────────────────────────────────┘
```

---

## Component Breakdown

### Server Component: `/walks/page.tsx`

**Purpose:** Fetch and display all walks

**Responsibilities:**
- Query database for all walks
- Handle empty state (no walks yet)
- Handle errors
- Render WalkCard components with data

**Why Server Component?**
- ✅ Can directly access database
- ✅ No client-side JavaScript needed for data fetching
- ✅ SEO-friendly (HTML sent with data)
- ✅ Faster initial render

```tsx
// Server Component - runs on server
async function WalksPage() {
  const supabase = await createClient()
  
  const { data: walks, error } = await supabase
    .from('walks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return <div>Error loading walks</div>
  }
  
  if (walks.length === 0) {
    return <EmptyState />
  }
  
  return (
    <div>
      {walks.map(walk => (
        <WalkCard key={walk.id} walk={walk} />
      ))}
    </div>
  )
}
```

---

### Client Component: `WalkCard.tsx` (Optional)

**Purpose:** Display individual walk with interactive features

**Responsibilities:**
- Display walk details
- Handle edit/delete button clicks (future)
- Expand/collapse notes (future)

**Why Client Component?**
- Could be Server Component if no interactivity needed!
- Only needs 'use client' if we add buttons, hover effects, etc.

**Decision:** Start with Server Component, add 'use client' only if needed

```tsx
// Could be Server Component initially
export function WalkCard({ walk }: { walk: Walk }) {
  return (
    <div>
      <h3>{walk.name}</h3>
      <p>{walk.distance_km} km • {walk.duration_minutes} min</p>
      <p>{walk.difficulty}</p>
      {walk.notes && <p>{walk.notes}</p>}
    </div>
  )
}
```

---

## File Structure

```
src/
├── app/
│   └── walks/
│       ├── page.tsx                🟦 NEW - Server Component (list walks)
│       └── new/
│           └── page.tsx            🟦 EXISTING (add walk)
│
├── components/
│   ├── AddWalkForm.tsx             🟥 EXISTING
│   ├── WalkCard.tsx                🟦/🟥 NEW - TBD based on interactivity
│   │
│   └── __tests__/
│       ├── AddWalkForm.test.tsx    🧪 EXISTING
│       └── WalkCard.test.tsx       🧪 NEW - Test walk card rendering
│
└── types/
    └── walk.ts                     📘 EXISTING
```

---

## Server Component vs Client Component Decision

### WalkCard Component - Should it be Server or Client?

```
OPTION A: Server Component (WalkCard.tsx)
┌─────────────────────────────────────┐
│ Pros:                               │
│ ✅ Less JavaScript to browser       │
│ ✅ Simpler code                     │
│ ✅ Can use async/await if needed    │
│                                     │
│ Cons:                               │
│ ❌ No interactivity (yet)           │
│ ❌ Need Server Action for buttons   │
└─────────────────────────────────────┘

OPTION B: Client Component (WalkCard.tsx)
┌─────────────────────────────────────┐
│ Pros:                               │
│ ✅ Can add onClick handlers         │
│ ✅ Can have hover effects           │
│ ✅ Can expand/collapse notes        │
│                                     │
│ Cons:                               │
│ ❌ More JavaScript to browser       │
│ ❌ Can't directly access DB         │
└─────────────────────────────────────┘

DECISION: Start with Server Component
          Add 'use client' only when we add interactive features
```

---

## Testing Strategy

### What to Test?

1. **WalkCard Component:**
   - ✅ Renders walk name
   - ✅ Renders distance and duration
   - ✅ Renders difficulty level
   - ✅ Renders notes if present
   - ✅ Doesn't render notes section if empty
   - ✅ Formats data correctly (e.g., "3.5 km", "45 min")

2. **Walks Page (Integration):**
   - ✅ Displays multiple walks
   - ✅ Shows empty state when no walks
   - ✅ Orders by created_at (newest first)
   - ✅ Shows error state on database error

---

## Empty State Design

```
┌─────────────────────────────────────────┐
│                                         │
│         🐕                              │
│                                         │
│    No walks yet!                        │
│    Ready to explore?                    │
│                                         │
│    [Add Your First Walk]                │
│         ↓                               │
│    Links to /walks/new                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Key Differences from "Add Walk" Feature

| Aspect | Add Walk | List Walks |
|--------|----------|------------|
| **Page type** | Server Component | Server Component |
| **Data flow** | Client → Server → DB | DB → Server → Client |
| **Interactivity** | High (form inputs) | Low (just display) |
| **Child components** | Client Component (form) | Server Component (cards) |
| **Database operation** | INSERT | SELECT |
| **When data fetched** | Never (user enters it) | On page load |

---

## Mental Model

```
ADD WALK (Previous Feature)
  Server Component (page)
       ↓
  Client Component (form)
       ↓ (user submits)
  Server Action
       ↓
  Database INSERT


LIST WALKS (This Feature)
  Database SELECT
       ↓
  Server Component (page)
       ↓
  Server Component (cards)
       ↓
  Browser (HTML already has data!)
```

---

## YAGNI Principle Applied

**What we're NOT building yet:**
- ❌ Edit walk functionality
- ❌ Delete walk functionality  
- ❌ Filter/search
- ❌ Pagination
- ❌ Sort options

**What we're building (minimal viable feature):**
- ✅ Display all walks
- ✅ Show walk details
- ✅ Empty state
- ✅ Basic styling

**We'll add more when we need it!**

