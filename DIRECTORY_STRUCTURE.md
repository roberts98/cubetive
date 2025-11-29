# Cubetive Directory Structure

This document describes the current feature-based directory structure following Domain-Driven Design (DDD) principles.

## Structure Overview

```
src/
├── main.tsx                          # App entry point
├── App.tsx                           # Root component with providers
├── types.ts                          # Global types (DTOs, commands)
│
├── features/                         # Feature domains (feature-first organization)
│   ├── auth/                        # Authentication feature
│   │   ├── components/              # Auth-specific components
│   │   ├── hooks/                   # Auth-specific hooks
│   │   ├── pages/                   # LoginPage, RegisterPage
│   │   └── services/                # Auth services
│   │
│   ├── landing/                     # Landing page feature
│   │   ├── components/              # Hero, FeatureCard
│   │   └── pages/                   # LandingPage
│   │
│   └── profile/                     # Profile management feature
│       ├── components/              # Profile-specific components
│       ├── hooks/                   # useProfile
│       ├── pages/                   # ProfilePage, PublicProfilePage
│       └── services/                # profileService (with tests)
│
├── shared/                           # Shared across 3+ features
│   ├── components/                  # Footer, Layout, etc.
│   ├── hooks/                       # useAsync (with tests)
│   ├── contexts/                    # AuthContext, ThemeContext (future)
│   └── theme/                       # MUI theme configuration
│
├── db/                              # Database layer
│   ├── supabase.ts                 # Supabase client
│   └── database.types.ts           # Auto-generated DB types
│
└── utils/                           # Pure utility functions
    ├── formatters/                  # time.ts, date.ts (future)
    └── validators/                  # email.ts, password.ts (future)
```

## Key Principles

1. **Feature-first organization**: Group by feature domain, not technical layer
2. **Self-contained features**: Each feature contains its own components, hooks, pages, and services
3. **Shared code rule**: Only code used by 3+ features goes in `shared/`
4. **Clean imports**: Features can import from other features, shared, db, and utils
5. **Type safety**: All DTOs and commands are defined in root-level `types.ts`

## Feature Structure Pattern

Each feature follows this pattern:
- `components/` - UI components specific to this feature
- `hooks/` - React hooks specific to this feature
- `pages/` - Page-level components (route targets)
- `services/` - Data fetching and business logic
- `lib/` (optional) - Pure business logic with zero React dependencies

## Import Paths

Features use relative imports for siblings and absolute paths for cross-cutting concerns:
- `../components/Foo` - Import from sibling in same feature
- `../../../shared/hooks/useAsync` - Import shared utilities
- `../../../db/supabase` - Import database client
- `../../../types` - Import global types

## Future Features (Planned)

Based on `.ai/ui-architecture-plan.md`, these features will be added:
- `features/timer/` - Timer, scramble, penalty controls
- `features/history/` - Solve history and filtering
- `features/analytics/` - Charts and statistics

## Migration Notes

This structure was migrated from a technical-layer organization (pages/, components/, services/) to a feature-first organization on 2025-11-29. All tests pass and the application builds successfully.
