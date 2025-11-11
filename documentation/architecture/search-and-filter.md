# Search & Filter Architecture

## Overview
Server-side filtering system using Next.js 15 App Router with URL-based state management and dynamic Supabase query building.

## Component Flow

```
┌─────────────────────────────────────┐
│   URL: /walks?search=park&difficulty=easy │
│   - Search params stored in URL      │
│   - Shareable/bookmarkable state     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   page.tsx (Server Component)        │
│   - Accepts searchParams prop        │
│   - Awaits params (Next.js 15 async) │
│   - Builds dynamic Supabase query    │
│   - Fetches filtered data            │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   SearchFilters (Client Component)   │
│   - 'use client' directive           │
│   - useRouter, useSearchParams       │
│   - Debounced search input (300ms)   │
│   - Updates URL on filter change     │
│   - Clear filters button             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│   WalksList (Client Component)       │
│   - Receives filtered walks          │
│   - Optimistic UI updates            │
│   - Empty state handling             │
└─────────────────────────────────────┘
```

## Architecture Details

### 1. URL State Management

**Why URL params?**
- Shareable filter states
- Bookmarkable searches
- Browser back/forward support
- Server-side rendering friendly
- No complex client state management needed

**Filter Parameters:**
- `search` - Walk name search (string)
- `difficulty` - Difficulty level (easy/moderate/hard)
- `minDistance` - Minimum distance in km (number)
- `maxDistance` - Maximum distance in km (number)

**Example URLs:**
```
/walks
/walks?search=park
/walks?search=river&difficulty=easy
/walks?minDistance=2&maxDistance=5
/walks?search=mountain&difficulty=hard&minDistance=5
```

### 2. Server Component (page.tsx)

**Responsibilities:**
- Accept async `searchParams` prop (Next.js 15 pattern)
- Build dynamic Supabase query based on active filters
- Execute query and fetch filtered data
- Pass data to child components

**Query Building Logic:**
```typescript
// Start with base query (user's walks only)
let query = supabase
  .from('walks')
  .select('*')
  .eq('user_id', user?.id)

// Conditionally add filters
if (params.search) {
  query = query.ilike('name', `%${params.search}%`)  // Case-insensitive LIKE
}

if (params.difficulty) {
  query = query.eq('difficulty', params.difficulty)   // Exact match
}

if (params.minDistance) {
  query = query.gte('distance_km', parseFloat(params.minDistance))  // Greater than or equal
}

if (params.maxDistance) {
  query = query.lte('distance_km', parseFloat(params.maxDistance))  // Less than or equal
}

// Always order by newest first
query = query.order('created_at', { ascending: false })
```

**Supabase Query Methods:**
- `.ilike(column, pattern)` - Case-insensitive pattern matching
- `.eq(column, value)` - Exact equality
- `.gte(column, value)` - Greater than or equal (≥)
- `.lte(column, value)` - Less than or equal (≤)
- `.order(column, options)` - Sort results

### 3. SearchFilters Component (Client)

**Why Client Component?**
- Needs `useRouter` for navigation
- Needs `useSearchParams` to read current URL
- Needs `useState` for controlled inputs
- Needs `useEffect` for debouncing

**Key Features:**

#### Debounced Search
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    updateURL({ search })
  }, 300)  // Wait 300ms after user stops typing
  
  return () => clearTimeout(timer)  // Cleanup on unmount or search change
}, [search])
```

**Why debounce?**
- Prevents excessive server requests
- Better UX - doesn't interrupt typing
- Reduces database load
- Industry standard pattern (300ms typical)

#### Immediate Updates (Select/Number)
```typescript
const handleDifficultyChange = (value: string) => {
  setDifficulty(value)
  updateURL({ difficulty: value })  // No debounce - immediate update
}
```

**Why immediate for select/number?**
- User makes deliberate choice (not continuous typing)
- Expected to trigger filter immediately
- No performance concern (single action)

#### URL Parameter Updates
```typescript
const updateURL = useCallback((updates: Record<string, string>) => {
  const params = new URLSearchParams(searchParams.toString())
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)    // Add/update param
    } else {
      params.delete(key)         // Remove if empty
    }
  })
  
  router.push(`?${params.toString()}`)  // Navigate with new params
}, [searchParams, router])
```

**Pattern Notes:**
- Preserves other params when updating one
- Removes param completely when value is empty
- Uses `useCallback` to prevent unnecessary recreations

#### Clear Filters
```typescript
const handleClearFilters = () => {
  setSearch('')
  setDifficulty('')
  setMinDistance('')
  setMaxDistance('')
  router.push('/')  // Navigate to home (no params)
}
```

### 4. Result Count Display

**Conditional rendering based on filters:**
```typescript
{!error && walks && hasActiveFilters && (
  <div>
    {walks.length === 0 ? (
      <p>No walks found matching your filters.</p>
    ) : (
      <p>Found <span>{walks.length}</span> walk{walks.length !== 1 ? 's' : ''}</p>
    )}
  </div>
)}
```

**When to show:**
- Only when filters are active
- After successful data fetch
- Shows count or "no results" message

### 5. Data Flow Sequence

**User Types in Search:**
```
1. User types "park" in search input
2. SearchFilters updates local state: setSearch('park')
3. useEffect triggered
4. 300ms timer starts
5. User stops typing
6. Timer completes → updateURL({ search: 'park' })
7. Router pushes new URL: /walks?search=park
8. Next.js re-renders page.tsx (Server Component)
9. page.tsx awaits searchParams → { search: 'park' }
10. Supabase query built with .ilike('name', '%park%')
11. Database filters walks
12. Filtered data returned to client
13. WalksList re-renders with new data
```

**User Changes Difficulty:**
```
1. User selects "easy" from dropdown
2. handleDifficultyChange called immediately
3. updateURL({ difficulty: 'easy' })
4. Router pushes /walks?search=park&difficulty=easy
5. Server re-fetches with both filters
6. UI updates with new results
```

## Performance Considerations

### Server-Side Filtering Benefits
- ✅ Database does the heavy lifting (optimized queries)
- ✅ Only matching data sent over network
- ✅ Works with large datasets (1000+ walks)
- ✅ Leverages Supabase indexes for fast queries
- ✅ Reduced client-side JavaScript bundle

### Next.js Optimizations
- Server Components don't send JavaScript to client
- Automatic caching of server responses
- Partial page updates (only affected components re-render)
- Route prefetching on hover

### Debouncing Benefits
- Reduces API calls by ~90% during typing
- Better database performance
- Smoother user experience
- Lower infrastructure costs

## Testing Strategy

### SearchFilters Component Tests
- ✅ Renders all filter inputs
- ✅ Loads initial values from URL params
- ✅ Debounces search input (300ms)
- ✅ Immediately updates difficulty/distance
- ✅ Clears all filters
- ✅ Preserves other params when updating one
- ✅ Removes empty params from URL

### Integration Considerations
- Server-side filtering tested via actual app usage
- Supabase queries validated through data verification
- Edge cases: empty results, invalid numbers, special characters

## Future Enhancements

**Potential additions:**
- [ ] Date range filtering (created_at)
- [ ] Sort order toggle (newest/oldest)
- [ ] Duration range filter
- [ ] Multiple difficulty selection
- [ ] Save filter presets
- [ ] Recent searches
- [ ] Filter combinations counter

## Key Learnings

### Next.js 15 Patterns
- `searchParams` is now an async Promise (must await)
- Server Components for data fetching
- Client Components for interactivity
- Proper use of `'use client'` directive

### React Patterns
- Debouncing with `useEffect` + `setTimeout`
- Controlled inputs with `useState`
- `useCallback` for stable function references
- Conditional rendering based on state

### URL State Management
- `URLSearchParams` API for param manipulation
- `useRouter().push()` for navigation
- `useSearchParams()` for reading current state
- Preserving params across updates

### Supabase Query Building
- Chaining filter methods
- Case-insensitive search with `.ilike()`
- Range queries with `.gte()` and `.lte()`
- Dynamic query construction

---

*Created: November 11, 2025*
*Last Updated: November 11, 2025*
