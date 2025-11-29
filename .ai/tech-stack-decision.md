# Tech Stack Decision - Cubetive MVP

## Chosen Stack

**Frontend:**
- React
- TypeScript
- Material UI

**Backend:**
- Supabase (Database + Auth + Real-time + Auto-generated API)

**Hosting & CI/CD:**
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)

## Rationale

### Why This Stack?

1. **Speed to MVP**: Supabase provides built-in auth, email verification, database, and auto-generated REST API - eliminating need for custom backend
2. **Lower Complexity**: Direct frontend-to-Supabase connection reduces code by ~50% vs NestJS approach
3. **Cost Effective**: $0-20/month vs $40-50/month with separate backend hosting
4. **Better Security**: Row Level Security (RLS) at database level reduces attack surface
5. **Simpler Deployment**: Git push deploys vs managing servers

### What We're NOT Using (and Why)

**NestJS** - Removed because:
- Application is 90% frontend (timer, scrambles, stats calculations are client-side)
- Backend needs are simple CRUD operations that Supabase handles automatically
- Would add unnecessary complexity, deployment overhead, and maintenance burden
- No complex business logic that requires custom API layer

**Digital Ocean** - Replaced with Vercel because:
- Simpler deployment (automatic from Git)
- Better developer experience
- Adequate for MVP scale
- Lower cost for initial phase

## Architecture

```
User → React App (Vercel) → Supabase (DB + Auth + API)
```

### Key Implementation Details

- Frontend uses `@supabase/supabase-js` for direct database access
- Row Level Security (RLS) policies enforce authorization
- Real-time subscriptions for live updates (if needed)
- Supabase Edge Functions for any future server-side logic

## Statistics Calculation Architecture

**Decision (2025-11-29):** Keep all statistics calculations client-side.

### Why Client-Side?

After evaluating Astro backend, Supabase Edge Functions, and client-side approaches:

1. **Calculations are trivially simple** - Ao5/Ao12/Ao100 are O(1) fixed-window operations
2. **Data volumes are small** - Only 100 solves needed for all current statistics (~15KB)
3. **No competitive features** - Personal tracking doesn't require server-authoritative validation
4. **Correctness is a testing problem** - Solved with comprehensive unit tests, not server architecture

### Why NOT Astro?

Astro was considered as a backend layer but rejected because:
- Astro is an SSR/static site framework, not an API backend framework
- Would add deployment complexity (monorepo, two services) without benefit
- Adds ~50-100ms latency per operation with no computational advantage
- The calculations don't need server-side compute power

### Implementation

Statistics module at `src/lib/statistics/`:
- `types.ts` - TypeScript interfaces (Solve, AverageResult, PersonalBests)
- `penalties.ts` - DNF/+2 effective time calculation
- `averages.ts` - Ao5, Ao12, Ao100 calculation with WCA rules
- `personalBests.ts` - PB detection and comparison

Data flow:
```
Timer stops → Local state update → Calculate stats (O(1)) → Display instantly
           → Async: INSERT to Supabase → If new PB: UPDATE profiles
```

## Migration Path

If complexity increases, we can add layers incrementally:

1. **Phase 1 (Current)**: React + Supabase (client-side calculations)
2. **Phase 2**: Add Supabase Edge Functions for competitive features (leaderboards, real-time battles)
3. **Phase 3**: Consider dedicated backend only if Edge Functions prove insufficient

## Decision Date

2025-11-24

## Reviewed Against PRD

All MVP requirements can be met with this simplified stack:
- ✅ Timer functionality (client-side React)
- ✅ Authentication & email verification (Supabase Auth)
- ✅ Statistics calculation (client-side)
- ✅ Data persistence (Supabase DB)
- ✅ Public profiles (Supabase RLS + simple queries)
- ✅ Performance requirements (<100ms timer, <3s page load)
- ✅ Security requirements (RLS, built-in auth)
