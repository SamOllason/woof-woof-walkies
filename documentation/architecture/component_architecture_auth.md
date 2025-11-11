# Component Architecture: Authentication Feature

Visual guide for implementing Supabase authentication with protected routes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  UNAUTHENTICATED USER                                               │
│                                                                     │
│  Browser requests /                                                │
│       ↓                                                             │
│  Middleware checks auth                                            │
│       ↓                                                             │
│  No session found                                                  │
│       ↓                                                             │
│  Redirect to /login                                                │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  /login page (Server Component)                               │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐  │ │
│  │  │  LoginForm (Client Component)                           │  │ │
│  │  │  'use client'                                           │  │ │
│  │  │                                                         │  │ │
│  │  │  [Email input]                                          │  │ │
│  │  │  [Password input]                                       │  │ │
│  │  │  [Login button]                                         │  │ │
│  │  │  [Link to Sign Up]                                      │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              ↓                                      │
│                    User submits credentials                         │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SERVER (Next.js)                                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Server Action: loginAction                                   │ │
│  │  'use server'                                                 │ │
│  │                                                               │ │
│  │  const supabase = await createClient()                       │ │
│  │  const { error } = await supabase.auth.signInWithPassword({ │ │
│  │    email,                                                     │ │
│  │    password                                                   │ │
│  │  })                                                           │ │
│  │                                                               │ │
│  │  if (error) return { error }                                 │ │
│  │  redirect('/')  // Success! Go to homepage                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE AUTH                                                      │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Validates credentials                                        │ │
│  │  Creates session                                              │ │
│  │  Returns JWT token                                            │ │
│  │  Sets auth cookie                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  AUTHENTICATED USER                                                 │
│                                                                     │
│  Browser requests / (again)                                        │
│       ↓                                                             │
│  Middleware checks auth                                            │
│       ↓                                                             │
│  Session found! ✅                                                  │
│       ↓                                                             │
│  Allow access to homepage                                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  / (Homepage - shows user's walks)                            │ │
│  │                                                                │ │
│  │  const { data: { user } } = await supabase.auth.getUser()    │ │
│  │                                                                │ │
│  │  const { data: walks } = await supabase                       │ │
│  │    .from('walks')                                             │ │
│  │    .select('*')                                               │ │
│  │    .eq('user_id', user.id)  ← Only user's walks!             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 1. Sign Up Flow

```
User visits /signup
      ↓
Fills email + password
      ↓
Clicks "Sign Up"
      ↓
Server Action: signupAction
      ↓
supabase.auth.signUp({ email, password })
      ↓
Supabase creates user in auth.users table
      ↓
Sends confirmation email (optional)
      ↓
Creates session
      ↓
Redirect to / (homepage)
```

---

### 2. Login Flow

```
User visits /login
      ↓
Fills email + password
      ↓
Clicks "Login"
      ↓
Server Action: loginAction
      ↓
supabase.auth.signInWithPassword({ email, password })
      ↓
Supabase validates credentials
      ↓
Creates session (JWT token in cookie)
      ↓
Redirect to / (homepage)
```

---

### 3. Logout Flow

```
User clicks "Logout"
      ↓
Server Action: logoutAction
      ↓
supabase.auth.signOut()
      ↓
Supabase clears session
      ↓
Redirect to /login
```

---

### 4. Protected Route Flow

```
User requests /walks/new
      ↓
Middleware runs (before page loads)
      ↓
Check: supabase.auth.getUser()
      ↓
Session exists? ✅
      ↓
Allow request
      ↓
Page renders


User requests /walks/new (no session)
      ↓
Middleware runs
      ↓
Check: supabase.auth.getUser()
      ↓
No session? ❌
      ↓
Redirect to /login
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/                      ← Route group (doesn't affect URL)
│   │   ├── login/
│   │   │   └── page.tsx            🟦 NEW - Login page (Server Component)
│   │   │
│   │   └── signup/
│   │       └── page.tsx            🟦 NEW - Signup page (Server Component)
│   │
│   ├── page.tsx                    🟦 UPDATE - Check auth, filter by user
│   │
│   └── walks/
│       └── new/
│           └── page.tsx            🟦 UPDATE - Add user_id to walks
│
├── components/
│   ├── LoginForm.tsx               🟥 NEW - Client Component
│   ├── SignupForm.tsx              🟥 NEW - Client Component
│   ├── LogoutButton.tsx            🟥 NEW - Client Component
│   │
│   └── __tests__/
│       ├── LoginForm.test.tsx      🧪 NEW
│       └── SignupForm.test.tsx     🧪 NEW
│
├── middleware.ts                   ⚙️ NEW - Protect routes
│
└── lib/
    └── supabase/
        ├── client.ts               📦 EXISTING
        └── server.ts               📦 EXISTING
```

---

## Component Breakdown

### 1. Middleware (Route Protection)

```tsx
// middleware.ts (runs before every request)

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Create Supabase client
  const supabase = createServerClient(...)
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protect routes
  if (!user && request.nextUrl.pathname !== '/login' && 
               request.nextUrl.pathname !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If logged in and trying to access login/signup, redirect to home
  if (user && (request.nextUrl.pathname === '/login' || 
               request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}
```

**Runs on:** Every request (before page loads)  
**Purpose:** Protect routes, redirect unauthenticated users

---

### 2. Login Page (Server Component)

```tsx
// app/(auth)/login/page.tsx

import { LoginForm } from '@/components/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  async function loginAction(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { error: error.message }
    }
    
    redirect('/') // Success! Go to homepage
  }
  
  return <LoginForm onLogin={loginAction} />
}
```

**Type:** Server Component  
**Purpose:** Define login Server Action, render form

---

### 3. LoginForm (Client Component)

```tsx
// components/LoginForm.tsx

'use client'

import { useState } from 'react'

export function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    const result = await onLogin(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // If success, Server Action will redirect
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={...} />
      <input type="password" value={password} onChange={...} />
      {error && <p>{error}</p>}
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

**Type:** Client Component  
**Purpose:** Interactive form with validation and loading states

---

## Database Changes

### 1. Update walks table to require user_id

```sql
-- Make user_id NOT NULL (after we have auth)
ALTER TABLE walks 
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint (ensures user exists)
ALTER TABLE walks
ADD CONSTRAINT walks_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

---

### 2. Enable Row-Level Security (RLS)

```sql
-- Enable RLS on walks table
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own walks
CREATE POLICY "Users can view own walks"
ON walks FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own walks
CREATE POLICY "Users can insert own walks"
ON walks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own walks
CREATE POLICY "Users can update own walks"
ON walks FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own walks
CREATE POLICY "Users can delete own walks"
ON walks FOR DELETE
USING (auth.uid() = user_id);
```

**What this does:**
- Users can ONLY see/edit/delete their own walks
- Database enforces this (not just app code)
- Super secure! 🔒

---

## Mental Model: Sessions & Cookies

```
┌─────────────────────────────────────────┐
│  BROWSER                                │
│                                         │
│  Cookie: sb-auth-token=eyJhbG...        │
│           ↑                             │
│           │                             │
│           └─ Sent with every request    │
│                                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  SERVER (Next.js Middleware)            │
│                                         │
│  Read cookie → Decode JWT → Get user_id │
│                                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  SUPABASE                               │
│                                         │
│  Validate JWT token                     │
│  Return user info                       │
│                                         │
└─────────────────────────────────────────┘
```

**The cookie IS the session!**
- Supabase stores JWT token in cookie
- Every request includes cookie
- Server validates token with Supabase
- No session storage needed on server

---

## Security Features

### 1. Password Requirements
- Minimum 6 characters (Supabase default)
- Can configure in Supabase dashboard

### 2. Rate Limiting
- Supabase has built-in rate limiting
- Prevents brute force attacks

### 3. Email Confirmation (Optional)
- Can require email verification
- Configurable in Supabase dashboard

### 4. Row-Level Security
- Database-level security
- Users can't access other users' data
- Even if your app code has a bug!

---

## Implementation Steps

We'll build this in order:

1. ✅ Create architecture diagram (done!)
2. ⬜ Create middleware for route protection
3. ⬜ Build SignupForm component (TDD)
4. ⬜ Build Signup page with Server Action
5. ⬜ Build LoginForm component (TDD)
6. ⬜ Build Login page with Server Action
7. ⬜ Build LogoutButton component
8. ⬜ Update homepage to check auth
9. ⬜ Update AddWalk to use real user_id
10. ⬜ Update database (make user_id NOT NULL)
11. ⬜ Enable RLS policies
12. ⬜ Test everything!

---

## Key Concepts to Learn

### 1. Middleware
- Runs before every request
- Can redirect based on conditions
- Checks authentication

### 2. Server Actions with Auth
- Get current user
- Pass user_id to database
- Secure by default

### 3. Row-Level Security (RLS)
- Database enforces access control
- SQL policies define rules
- Super secure!

### 4. Session Management
- JWT tokens in cookies
- Automatic token refresh
- Handled by Supabase

---

_Ready to start building! Let's go step by step._ 🚀
