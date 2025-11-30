# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cubetive is a web-based Rubik's Cube speedcubing timer and analytics platform. It provides WCA (World Cube Association) standard timing controls, statistics tracking, and public profile sharing.

## Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:5173
npm run build            # TypeScript check + production build (outputs to /dist)
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run preview          # Preview production build locally
npm test                 # Run tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
```

## Tech Stack

### Frontend

- **React 19** with React Compiler (babel-plugin-react-compiler)
- **TypeScript 5.9** (strict mode enabled)
- **Vite** (rolldown-based for fast builds)
- **Material UI 7** (@mui/material, @emotion/react, @emotion/styled)
- **React Router 7** for routing
- **React Hook Form 7** + **Zod 4** for form handling and validation
- **Zustand 5** for state management

### Backend

- **Supabase** (PostgreSQL v17, Auth, RLS policies, auto-generated REST API)
- **PostgREST** for auto-generated RESTful API from PostgreSQL schema

### Development Tools

- **ESLint 9** for linting
- **Prettier 3** for code formatting
- **Husky 9** for git hooks
- **lint-staged 16** for pre-commit checks
- **Vitest 4** for testing

### Hosting

- **Vercel** (frontend)
- **Supabase** (backend/database)

---

## Architecture

### Why No Traditional Backend?

This project uses **Supabase + PostgREST** instead of a traditional backend (e.g., NestJS, Express). See `.ai/tech-stack-decision.md` for full rationale:

- **Direct frontend-to-database**: React app communicates directly with Supabase using `@supabase/supabase-js`
- **Auto-generated REST API**: PostgREST generates RESTful endpoints from PostgreSQL schema
- **Row Level Security (RLS)**: Authorization handled at database level via RLS policies
- **Client-side calculations**: Timer logic, scramble generation, and statistics (Ao5, Ao12, Ao100) are handled client-side
- **No custom API layer**: Reduces complexity, deployment overhead, and cost

### Project Structure

```
/src
├── /features          # Feature-based organization (domain-driven design)
│   ├── /auth          # Authentication feature
│   │   ├── /components    # Feature-specific React components
│   │   ├── /hooks         # Feature-specific custom hooks
│   │   ├── /pages         # Feature-specific pages/routes
│   │   ├── /schemas       # Zod schemas for form validation
│   │   ├── /services      # Service layer for Supabase operations
│   │   ├── /stores        # Zustand stores for local state
│   │   └── /types         # TypeScript types/interfaces
│   ├── /profile       # User profile feature
│   └── /timer         # Timer feature (future)
├── /shared            # Shared/common code
│   ├── /components    # Reusable UI components
│   ├── /hooks         # Reusable custom hooks (e.g., useAsync)
│   └── /utils         # Utility functions
├── /db                # Database connection
│   └── supabase.ts    # Supabase client initialization
├── /types             # Global TypeScript types
└── App.tsx            # Root component

/supabase
└── /migrations        # Database migrations with RLS policies

/.ai                   # AI-readable documentation
├── prd.md                     # Product requirements document
├── DATABASE_SCHEMA.md         # Database design documentation
└── tech-stack-decision.md     # Tech stack rationale
```

### Feature-Based Organization (Domain-Driven Design)

Each feature is self-contained with all related code in one directory:

- **components/** - React components specific to the feature
- **hooks/** - Custom hooks for data fetching and business logic
- **pages/** - Page components (routes) for the feature
- **schemas/** - Zod validation schemas for forms
- **services/** - Service layer for Supabase API calls
- **stores/** - Zustand stores for local state management
- **types/** - TypeScript types/interfaces for the feature

**Example:** `/src/features/auth/` contains everything related to authentication.

---

## Code Style & Conventions

### ESLint & Prettier

- **ESLint**: TypeScript-first linting with React Hooks rules and Prettier integration
- **Prettier**: Consistent code formatting (single quotes, 2 spaces, 100 print width, semicolons)
- **Pre-commit hooks**: Husky + lint-staged automatically run ESLint and Prettier on staged files

**Configuration files:**

- `eslint.config.js` - ESLint 9 flat config with TypeScript, React Hooks, and Prettier
- `.prettierrc` - Prettier config (single quotes, 2 spaces, semicolons, LF line endings)
- `.husky/pre-commit` - Runs `lint-staged` on commit
- `package.json` (lint-staged) - Auto-fixes ESLint errors and formats code

**Pre-commit behavior:**

```bash
git commit
# Automatically runs on staged files:
# 1. ESLint --fix (auto-fix linting errors)
# 2. Prettier --write (format code)
```

### TypeScript Guidelines

- **Strict mode enabled** (`tsconfig.json`)
- **Explicit types** for function parameters and return types
- **Type inference** for local variables where obvious
- **Interfaces over types** for object shapes (prefer `interface` over `type`)
- **Use Zod** for runtime validation and infer TypeScript types from schemas

### Material UI Guidelines

- **Minimize custom CSS**: Use Material UI's styling system (@emotion/styled, sx prop)
- **Create reusable components**: Extract common UI patterns into shared components
- **Use theme consistently**: Leverage Material UI's theming system for colors, spacing, typography
- **Prefer composition**: Build complex UIs by composing smaller Material UI components

**Examples:**

```tsx
// ✅ Good: Use Material UI components and sx prop
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>
  <Button variant="contained">Submit</Button>
</Box>

// ❌ Avoid: Custom CSS classes
<div className="custom-flex-container">
  <button className="custom-button">Submit</button>
</div>

// ✅ Good: Create reusable component
<AuthFormContainer>
  <TextField {...register('email')} />
</AuthFormContainer>
```

---

## Data Fetching & Business Logic

### Data Fetching Pattern

We use a consistent pattern for fetching data from Supabase:

**1. Service Layer** (`/features/*/services/`)

- Static class methods that wrap Supabase operations
- Handle errors and return typed data
- Example: `AuthService.login()`, `ProfileService.getCurrentUserProfile()`

**2. Custom Hooks** (`/features/*/hooks/`)

- Wrap service calls with `useAsync` hook
- Provide `{ data, loading, error, execute, reset }` interface
- Handle loading and error states automatically
- Example: `useCurrentProfile()`, `useAuth()`

**3. Shared useAsync Hook** (`/src/shared/hooks/useAsync.ts`)

- Generic async operation handler
- Manages loading, error, and data states
- Supports immediate execution or manual triggering
- Provides `execute()` for refetch and `reset()` for state clearing

### Example: Data Fetching Flow

**Service Layer** (`/src/features/profile/services/profileService.ts`):

```typescript
export async function getCurrentUserProfile(): Promise<ProfileDTO> {
  const { data, error } = await supabase.from('profiles').select('*').single();

  if (error) throw error;
  return data;
}
```

**Custom Hook** (`/src/features/profile/hooks/useProfile.ts`):

```typescript
import { useAsync } from '../../../shared/hooks/useAsync';
import { getCurrentUserProfile } from '../services/profileService';

export function useCurrentProfile() {
  return useAsync<ProfileDTO>(getCurrentUserProfile);
}
```

**Component Usage**:

```typescript
function ProfileDashboard() {
  const { data: profile, loading, error, execute: refetch } = useCurrentProfile();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!profile) return null;

  return (
    <Box>
      <Typography variant="h1">Welcome, {profile.username}!</Typography>
      <Button onClick={refetch}>Refresh Profile</Button>
    </Box>
  );
}
```

### Where Business Logic Lives

**Custom Hooks** (`/features/*/hooks/`)

- Primary location for business logic
- Data fetching logic (wrapping services with `useAsync`)
- Complex state management and side effects
- Derived state calculations
- Event handlers and user interactions

**Examples of business logic in hooks:**

- Timer state management (start, stop, reset)
- Statistics calculations (Ao5, Ao12, Ao100)
- Form submission workflows
- Real-time subscriptions to Supabase

**Services remain thin:**

- Only handle Supabase API calls
- No complex logic - just CRUD operations
- Error handling and type safety

---

## Form Handling

### React Hook Form + Zod Pattern

We use **React Hook Form 7** with **Zod 4** for all form handling:

**1. Define Zod Schema** (`/features/*/schemas/`)

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

**2. Use in Component with React Hook Form**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/auth.schemas';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        {...register('password')}
        type="password"
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        Login
      </Button>
    </form>
  );
}
```

**Key Points:**

- Use `register()` to connect inputs to React Hook Form
- Use `zodResolver` to integrate Zod validation
- Infer TypeScript types from Zod schemas with `z.infer<>`
- Material UI's `TextField` works seamlessly with `register()`
- Access errors via `formState.errors`
- Use `handleSubmit()` to wrap submission logic

---

## Database & Supabase

### Core Tables

**profiles** (extends `auth.users`):

- User profiles with username, visibility settings
- Denormalized stats (pb_single, pb_ao5, pb_ao12)
- Auto-created on signup via database trigger

**solves**:

- Individual solve records (time_ms, scramble, penalty_type)
- Belongs to user (foreign key to profiles)

**All tables:**

- Use soft deletes (`deleted_at` column)
- Have RLS policies enabled
- Auto-update `updated_at` via trigger

### Supabase Client Setup

**Initialize once** (`/src/db/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Use in services** (not directly in components):

```typescript
import { supabase } from '../../../db/supabase';

export async function getCurrentUserProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single();

  if (error) throw error;
  return data;
}
```

### Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Never commit `.env.local`** - it's in `.gitignore`.

---

## State Management

### Zustand for Global State

Use **Zustand 5** for global state that needs to be shared across features:

```typescript
// /features/auth/stores/authStore.ts
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

**When to use Zustand:**

- Global auth state
- UI state shared across features
- Persisted preferences

**When NOT to use Zustand:**

- Server state (use `useAsync` + Supabase instead)
- Component-local state (use `useState`)
- Form state (use React Hook Form)

---

## Testing

### Vitest + Testing Library

```bash
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

**Test files**: Co-located with source files (`*.test.ts`, `*.test.tsx`)

**Example**:

```
/features/profile
├── services/
│   ├── profileService.ts
│   └── profileService.test.ts
```

---

## Key Documentation Files

- `CLAUDE.md` (this file) - Development guidelines for AI assistance
- `.ai/prd.md` - Product requirements document
- `.ai/DATABASE_SCHEMA.md` - Database design and RLS policies
- `.ai/tech-stack-decision.md` - Tech stack rationale and architecture decisions
- `supabase/migrations/` - Database migrations with RLS policies

---

## Common Patterns

### Authentication Flow

1. User submits form (React Hook Form + Zod validation)
2. Component calls service method (e.g., `AuthService.login()`)
3. Service calls Supabase Auth API
4. Service returns typed response or throws error
5. Component updates UI based on result

### Data Fetching Flow

1. Component uses custom hook (e.g., `useCurrentProfile()`)
2. Hook wraps service with `useAsync`
3. `useAsync` manages loading/error/data states
4. Component renders based on state
5. User can trigger refetch with `execute()`

### Form Submission Flow

1. Define Zod schema in `/schemas/`
2. Create form with React Hook Form + `zodResolver`
3. On submit, call service method
4. Handle loading/error states in component
5. Show success message or error to user

---

## Best Practices

### Do's ✅

- Use feature-based organization (directory per feature)
- Fetch data via custom hooks wrapping `useAsync`
- Validate forms with Zod schemas
- Use Material UI components and minimize custom CSS
- Create reusable components for common patterns
- Handle errors gracefully with user-friendly messages
- Use TypeScript strict mode and explicit types
- Write tests for business logic and services
- Use RLS policies for authorization at database level
- Keep services thin (just CRUD operations)
- Put business logic in custom hooks

### Don'ts ❌

- Don't fetch data directly in components (use hooks)
- Don't bypass React Hook Form for form handling
- Don't write custom CSS when Material UI can handle it
- Don't put business logic in components (use hooks)
- Don't expose raw Supabase errors to users (map them)
- Don't skip Zod validation on forms
- Don't create unnecessary abstractions
- Don't store server state in Zustand (use `useAsync`)
- Don't bypass RLS policies by calling Supabase directly in components

---

## Deployment

### Frontend (Vercel)

- **Auto-deploy on push to main** (GitHub integration)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Set in Vercel dashboard

### Backend (Supabase)

- **Migrations**: Apply via Supabase CLI or dashboard
- **RLS policies**: Defined in migration files
- **Environment variables**: Never commit secrets

---

## Additional Notes

- **React Compiler**: Enabled via `babel-plugin-react-compiler` for automatic optimization
- **Soft deletes**: All tables use `deleted_at` column instead of hard deletes
- **Client-side stats**: Ao5, Ao12, Ao100 calculations are client-side (see `.ai/tech-stack-decision.md`)
- **No custom backend**: Direct frontend-to-Supabase communication via PostgREST

---

**Last updated:** 2025-11-30
