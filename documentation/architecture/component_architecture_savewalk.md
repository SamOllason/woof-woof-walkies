# Component Architecture Diagram

Visual guide to understanding how our app's components work together, especially Server vs Client Components.

---

## Current Architecture: "Add a Walk" Feature

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER (Client-Side)                                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  /walks/new - Rendered HTML from Server                       │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  AddWalkForm (Client Component)                          │ │ │
│  │  │  'use client'                                            │ │ │
│  │  │                                                          │ │ │
│  │  │  State:                                                  │ │ │
│  │  │  • formData = { name: '', distance_km: 0, ... }         │ │ │
│  │  │  • errors = { }                                         │ │ │
│  │  │                                                          │ │ │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  User types "Riverside Loop"                       │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  onChange fires                                    │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  setState({ name: "Riverside Loop" })             │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  React re-renders                                 │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  Input shows "Riverside Loop"                     │ │ │ │
│  │  │  └────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                          │ │ │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  User clicks "Save Walk"                           │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  onSubmit={(e) => { ... }}                        │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  Validate form                                    │ │ │ │
│  │  │  │         ↓                                          │ │ │ │
│  │  │  │  await onSubmit(formData)  ← Calls Server Action │ │ │ │
│  │  │  └────────────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
│                         HTTP POST                                   │
│                   (Next.js handles this automatically)              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SERVER (Node.js / Next.js)                                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  src/app/walks/new/page.tsx (Server Component)               │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  handleSubmit (Server Action)                           │ │ │
│  │  │  'use server'                                           │ │ │
│  │  │                                                         │ │ │
│  │  │  Receives: { name: "Riverside Loop", distance_km: 3.5 }│ │ │
│  │  │       ↓                                                 │ │ │
│  │  │  const supabase = await createClient()                 │ │ │
│  │  │       ↓                                                 │ │ │
│  │  │  await supabase.from('walks').insert({...})            │ │ │
│  │  │       ↓                                                 │ │ │
│  │  │  redirect('/')                                         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE (PostgreSQL Database)                                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  walks table                                                  │ │
│  │                                                               │ │
│  │  INSERT INTO walks (name, distance_km, user_id, ...)         │ │
│  │  VALUES ('Riverside Loop', 3.5, null, ...)                   │ │
│  │       ↓                                                       │ │
│  │  ✅ Row created!                                              │ │
│  │       ↓                                                       │ │
│  │  Return: { id: 'abc-123', name: 'Riverside Loop', ... }      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Server Component vs Client Component

### Visual Comparison

```
SERVER COMPONENT                        CLIENT COMPONENT
(page.tsx)                             (AddWalkForm.tsx)

┌─────────────────────────┐            ┌─────────────────────────┐
│  Runs on Server         │            │  Runs in Browser        │
│  - On page load         │            │  - After HTML loads     │
│  - On Server Action     │            │  - Re-renders on state  │
│                         │            │                         │
│  Can:                   │            │  Can:                   │
│  ✅ async/await         │            │  ✅ useState/useEffect  │
│  ✅ Direct DB access    │            │  ✅ Event handlers      │
│  ✅ Server-only code    │            │  ✅ Browser APIs        │
│  ✅ Keep secrets safe   │            │  ✅ User interactions   │
│                         │            │                         │
│  Cannot:                │            │  Cannot:                │
│  ❌ useState/useEffect  │            │  ❌ Be async function   │
│  ❌ Event handlers      │            │  ❌ Direct DB access    │
│  ❌ Browser APIs        │            │  ❌ Use server secrets  │
└─────────────────────────┘            └─────────────────────────┘
         │                                       │
         │                                       │
         └────────── Can pass props ────────────┘
                   (including Server Actions)
```

---

## File Structure Map

```
src/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    🟦 Server Component (Root layout)
│   ├── page.tsx                      🟦 Server Component (Home page)
│   │
│   └── walks/
│       └── new/
│           └── page.tsx              🟦 Server Component
│                                        - Defines handleSubmit (Server Action)
│                                        - Passes to AddWalkForm
│
├── components/
│   ├── AddWalkForm.tsx               🟥 Client Component
│   │                                    - 'use client' directive
│   │                                    - Has useState, event handlers
│   │
│   └── __tests__/
│       └── AddWalkForm.test.tsx      🧪 Test file
│
├── lib/
│   └── supabase/
│       ├── client.ts                 📦 Browser Supabase client
│       └── server.ts                 📦 Server Supabase client
│
└── types/
    └── walk.ts                       📘 TypeScript types


🟦 = Server Component (no 'use client')
🟥 = Client Component (has 'use client')
```

---

## Data Flow: User Submits Form

```
Step 1: User Interaction (Browser)
┌─────────────────────────────────┐
│  User fills form                │
│  User clicks "Save Walk"        │
└────────────┬────────────────────┘
             │
             ↓
Step 2: Client Component (Browser)
┌─────────────────────────────────┐
│  AddWalkForm.tsx                │
│  - Validates data               │
│  - Calls: await onSubmit(data) │
└────────────┬────────────────────┘
             │
             ↓ (HTTP POST - Next.js handles this)
             │
Step 3: Server Action (Server)
┌─────────────────────────────────┐
│  page.tsx - handleSubmit        │
│  'use server'                   │
│  - Receives data                │
│  - Creates Supabase client      │
│  - Calls database               │
└────────────┬────────────────────┘
             │
             ↓
Step 4: Database (Supabase)
┌─────────────────────────────────┐
│  PostgreSQL                     │
│  - Validates constraints        │
│  - Inserts row                  │
│  - Returns new walk             │
└────────────┬────────────────────┘
             │
             ↓
Step 5: Response (Server → Browser)
┌─────────────────────────────────┐
│  redirect('/') in Server Action │
│  - Browser redirects to home    │
└─────────────────────────────────┘
```

---

## Server Actions in Detail

```
SERVER ACTION = Function that runs on server but can be called from client

┌──────────────────────────────────────────────────────────────┐
│  SERVER COMPONENT (page.tsx)                                 │
│                                                              │
│  export default function Page() {                           │
│    const handleSubmit = async (data) => {                   │
│      'use server'  ← This makes it a Server Action          │
│                                                              │
│      // This code runs on SERVER                            │
│      const supabase = await createClient()                  │
│      await supabase.from('walks').insert(data)              │
│      redirect('/')                                          │
│    }                                                         │
│                                                              │
│    return <AddWalkForm onSubmit={handleSubmit} />           │
│             │                        │                       │
│             │                        └─ Passes function      │
│             └─ Client Component                             │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                      │
                      │ Function passed as prop
                      ↓
┌──────────────────────────────────────────────────────────────┐
│  CLIENT COMPONENT (AddWalkForm.tsx)                          │
│                                                              │
│  'use client'                                                │
│                                                              │
│  export default function AddWalkForm({ onSubmit }) {         │
│    const handleSubmit = async (e) => {                      │
│      e.preventDefault()                                     │
│      await onSubmit(formData)  ← Calls Server Action        │
│           │                                                  │
│           └─ Next.js converts this to HTTP request!         │
│    }                                                         │
│                                                              │
│    return <form onSubmit={handleSubmit}>...</form>          │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Rendering Flow

```
INITIAL PAGE LOAD
─────────────────

Server:
  ┌─────────────────────────────────────────┐
  │ 1. Request to /walks/new                │
  │                                         │
  │ 2. Next.js runs page.tsx (Server Comp) │
  │    - Defines handleSubmit               │
  │    - Renders <AddWalkForm />            │
  │                                         │
  │ 3. Generates HTML                       │
  │    - Includes form structure            │
  │    - Includes Tailwind CSS              │
  │                                         │
  │ 4. Sends HTML + JavaScript to browser  │
  └─────────────────────────────────────────┘
                    ↓
Browser:
  ┌─────────────────────────────────────────┐
  │ 5. Receives HTML                        │
  │    - Shows form immediately (fast!)     │
  │                                         │
  │ 6. Loads JavaScript                     │
  │    - React hydrates                     │
  │    - AddWalkForm becomes interactive    │
  │                                         │
  │ 7. User can now type and interact      │
  └─────────────────────────────────────────┘
```

---

## Future Architecture: List All Walks

```
┌─────────────────────────────────────────────────────────────┐
│  /walks - List Page (Server Component)                      │
│                                                             │
│  async function WalksPage() {                               │
│    // Fetch data on server                                 │
│    const supabase = await createClient()                   │
│    const { data: walks } = await supabase                  │
│      .from('walks')                                        │
│      .select('*')                                          │
│      .order('created_at', { ascending: false })            │
│                                                             │
│    return (                                                │
│      <div>                                                 │
│        {walks.map(walk => (                               │
│          <WalkCard key={walk.id} walk={walk} />  ← Client │
│        ))}                                                 │
│      </div>                                                │
│    )                                                       │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Renders with data
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  WalkCard (Client Component)                                │
│  'use client'                                               │
│                                                             │
│  - Interactive buttons (Edit, Delete)                      │
│  - Hover effects                                           │
│  - Click to expand                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Mental Model Summary

### Think of it like this:

```
SERVER COMPONENT = A Chef in the kitchen
  - Has access to ingredients (database, secrets)
  - Prepares the meal (fetches data, runs queries)
  - Sends finished dish to customer (HTML to browser)
  - Customer never sees the kitchen

CLIENT COMPONENT = Interactive menu at the table
  - Customer can interact with it (click, type, scroll)
  - Updates based on customer actions
  - Can ask kitchen for more (call Server Actions)
  - Runs at the customer's table (browser)

SERVER ACTION = Waiter
  - Takes order from customer (client component)
  - Brings it to kitchen (server)
  - Returns result
  - Customer doesn't go to kitchen themselves
```

---

## Key Rules

| Rule | Why |
|------|-----|
| **Server Components are default** | Better performance, less JS |
| **Add 'use client' only when needed** | Keep bundle small |
| **Server Components can import Client Components** | ✅ Allowed |
| **Client Components CANNOT import Server Components** | ❌ Not allowed |
| **Server Actions bridge the gap** | Pass functions from Server → Client |

---

## Common Patterns

### ✅ GOOD: Server fetches, Client displays interactively
```tsx
// Server Component
async function Page() {
  const data = await fetchData()
  return <InteractiveList data={data} />  // Client Component
}
```

### ✅ GOOD: Server Action for mutations
```tsx
// Server Component
function Page() {
  async function saveData(input) {
    'use server'
    await db.insert(input)
  }
  return <Form onSubmit={saveData} />  // Client Component
}
```

### ❌ BAD: Client Component trying to access database
```tsx
'use client'
function Component() {
  // ❌ Can't do this - no database access from browser!
  const data = await supabase.from('walks').select()
}
```

---

_This diagram will be updated as we add more features!_
