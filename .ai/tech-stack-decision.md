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

## Migration Path

If complexity increases, we can add layers incrementally:

1. **Phase 1 (Current)**: React + Supabase
2. **Phase 2**: Add Supabase Edge Functions for complex logic
3. **Phase 3**: Consider NestJS only if genuinely needed (unlikely for MVP+)

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
