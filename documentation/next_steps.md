# Next Steps - Getting Started

## 1. Install Supabase Dependencies

```powershell
npm install @supabase/supabase-js @supabase/ssr
```

**What these do:**
- `@supabase/supabase-js`: Main Supabase client for database queries, auth, real-time
- `@supabase/ssr`: Server-side rendering helpers for Next.js App Router

---

## 2. Install Testing Dependencies (for TDD)

```powershell
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

**What these do:**
- `vitest`: Fast test runner (like Jest but faster)
- `@vitejs/plugin-react`: Allows Vitest to understand React components
- `@testing-library/react`: Test React components the way users interact with them
- `@testing-library/jest-dom`: Extra matchers like `toBeInTheDocument()`
- `jsdom`: Simulates browser DOM for tests

---

## 3. Create Supabase Project

### 3.1 Sign up and create project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name:** woof-woof-walkies (or whatever you prefer)
   - **Database Password:** Generate a strong one (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free tier is fine
5. Wait 2-3 minutes for project to provision

### 3.2 Get your API keys
1. In Supabase dashboard, go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3.3 Create environment variables
Create a file `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** This file is already in `.gitignore` - never commit it!

---

## 4. Configure Vitest

Create `vitest.config.ts` in project root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `vitest.setup.ts` in project root:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

---

## 5. Add Test Script to package.json

Add this to your `"scripts"` section in `package.json`:

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:run": "vitest run"
```

Now you can run:
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once (for CI)

---

## 6. Verify Tailwind Setup

Check that `tailwindcss` is configured. You should have:

### `tailwind.config.ts` (or similar):
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

### `src/app/globals.css` should have:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 7. Initialize Supabase Client

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

---

## 8. Design Database Schema

Before creating tables, plan your schema. Based on features:

### Tables needed:
1. **walks** - Saved walk templates
   - id, name, distance, duration, difficulty, notes, user_id, created_at

2. **walk_instances** - Logged instances of walks
   - id, walk_id, date, weather, notes, user_id, created_at

3. **users** (handled by Supabase Auth automatically)

### Next session tasks:
- [ ] Define schema in detail
- [ ] Create migrations in Supabase SQL editor
- [ ] Set up Row-Level Security (RLS) policies
- [ ] Write first test
- [ ] Build first component

---

## Quick Start Checklist

- [ ] Run `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Run `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Create Supabase project at supabase.com
- [ ] Create `.env.local` with API keys
- [ ] Create `vitest.config.ts`
- [ ] Create `vitest.setup.ts`
- [ ] Add test scripts to `package.json`
- [ ] Create Supabase client utilities
- [ ] Verify dev server runs: `npm run dev`
- [ ] Verify tests run: `npm test`

---

**When ready to continue:** Start with database schema design and first feature (adding a walk).
