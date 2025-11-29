# UI Architecture Plan - Cubetive MVP

## Executive Summary

This plan provides a **balanced, pragmatic architecture** for Cubetive that enables fast MVP delivery while maintaining code quality and future scalability. The architecture combines:
- **Feature-first organization** for fast development velocity
- **Clean separation of concerns** where it adds clear value
- **Simple patterns** that avoid over-engineering
- **Type-safe foundations** throughout

### User-Confirmed Tech Decisions
- ✅ Material UI v7
- ✅ React Router v7
- ✅ Recharts for visualization
- ✅ 3-panel inline layout (stats + timer + recent solves)

---

## 1. Directory Structure

**Philosophy**: Feature-first organization with shared utilities. Group by feature domain, not technical layer.

```
src/
├── main.tsx                          # App entry point
├── App.tsx                           # Root component with providers
├── types.ts                          # Global types (already exists ✓)
│
├── features/                         # Feature domains
│   ├── auth/
│   │   ├── components/              # LoginForm, RegisterForm, etc.
│   │   ├── hooks/                   # useAuth
│   │   ├── pages/                   # LoginPage, RegisterPage
│   │   └── services/                # authService
│   │
│   ├── timer/
│   │   ├── components/              # Timer, Scramble, PenaltyControls
│   │   ├── hooks/                   # useTimer, useScramble, useKeyboardTimer
│   │   ├── pages/                   # TimerPage (3-panel layout)
│   │   ├── services/                # solveService
│   │   └── lib/                     # statistics.ts, scrambleGenerator.ts
│   │
│   ├── profile/
│   │   ├── components/              # ProfileSettings, ProfileStats
│   │   ├── hooks/                   # useCurrentProfile (exists ✓), usePublicProfile
│   │   ├── pages/                   # ProfilePage, PublicProfilePage
│   │   └── services/                # profileService (exists ✓)
│   │
│   ├── history/
│   │   ├── components/              # SolveList, SolveListItem, SolveFilters
│   │   ├── hooks/                   # useSolves
│   │   └── pages/                   # HistoryPage
│   │
│   └── analytics/
│       ├── components/              # ProgressChart, DistributionChart, StatsCard
│       ├── hooks/                   # useStatistics
│       └── pages/                   # AnalyticsPage
│
├── shared/                           # Shared across 3+ features
│   ├── components/                  # Layout, ProtectedRoute, LoadingSpinner, ErrorAlert
│   ├── hooks/                       # useAsync (exists ✓)
│   ├── contexts/                    # AuthContext, ThemeContext
│   └── theme/                       # MUI theme configuration
│
├── db/                              # Database layer (exists ✓)
│   ├── supabase.ts
│   └── database.types.ts
│
└── utils/                           # Pure utility functions
    ├── formatters/                  # time.ts, date.ts
    └── validators/                  # email.ts, password.ts, username.ts
```

**Key Principles**:
- Features are self-contained (components, hooks, pages, services together)
- Shared code is truly shared (used by 3+ features)
- Services map 1:1 to database tables
- Pure business logic in `lib/` folders (zero React dependencies)

---

## 2. Component Hierarchy

### 2.1 TimerPage - 3-Panel Layout (Main View)

```
TimerPage
├── Grid (Material UI Grid2, 3-column responsive)
│   ├── LeftPanel (Stats) - xs=12 md=3
│   │   ├── Card: Session Statistics
│   │   │   ├── StatsCard (Current Ao5)
│   │   │   ├── StatsCard (Current Ao12)
│   │   │   ├── StatsCard (Session Best)
│   │   │   └── StatsCard (Session Mean)
│   │   └── Card: Personal Bests
│   │       ├── StatsCard (PB Single)
│   │       ├── StatsCard (Best Ao5)
│   │       └── StatsCard (Best Ao12)
│   │
│   ├── CenterPanel (Timer) - xs=12 md=6
│   │   └── Card
│   │       ├── Scramble (monospace, 18px)
│   │       ├── Timer (huge display, h1 typography)
│   │       ├── TimerInstructions ("Press spacebar to start")
│   │       └── PenaltyControls (+2/DNF/Delete buttons)
│   │
│   └── RightPanel (Recent Solves) - xs=12 md=3
│       └── Card: Recent Solves (last 12)
│           └── List
│               └── SolveListItem (×12)
```

**Responsive Behavior**:
- **Desktop (md+)**: 3-column layout (25% | 50% | 25%)
- **Mobile (xs)**: Stacked vertically (Timer first, then stats, then recent)

### 2.2 Component Pattern: Smart vs Presentational

**Smart (Container) Components** in `pages/`:
- Handle data fetching (useAsync, services)
- Manage business logic (statistics calculations)
- Connect to contexts (useAuth)
- Pass data + callbacks to presentational components

**Presentational Components** in `components/`:
- Pure UI rendering from props
- No direct data fetching or business logic
- Highly reusable and testable
- Type-safe prop interfaces

**Example**:
```typescript
// Smart: pages/TimerPage.tsx
function TimerPage() {
  const timer = useTimer();
  const scramble = useScramble();
  const { solves, refetch } = useSolves({ limit: 100 });
  const stats = useStatistics(solves);

  const handleSolveComplete = async (timeMs: number) => {
    await solveService.create({ timeMs, scramble: scramble.current });
    await refetch();
    scramble.regenerate();
  };

  return <TimerPanel timer={timer} onComplete={handleSolveComplete} />;
}

// Presentational: components/timer/Timer.tsx
interface TimerProps {
  timeMs: number;
  state: 'idle' | 'ready' | 'timing';
  onStart: () => void;
  onStop: () => void;
}

function Timer({ timeMs, state, onStart, onStop }: TimerProps) {
  return (
    <Typography variant="h1" color={state === 'ready' ? 'success' : 'default'}>
      {formatTime(timeMs)}
    </Typography>
  );
}
```

---

## 3. Routing Structure

### 3.1 Route Configuration (React Router v7)

```typescript
// App.tsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/reset-password" element={<PasswordResetPage />} />
  <Route path="/u/:username" element={<PublicProfilePage />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/timer" element={<TimerPage />} />
    <Route path="/history" element={<HistoryPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* Fallback */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### 3.2 Protected Route Implementation

```typescript
// shared/components/ProtectedRoute.tsx
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
```

### 3.3 Post-Login Redirect

```typescript
// After successful login, redirect to original destination or /timer
const from = location.state?.from?.pathname || '/timer';
navigate(from, { replace: true });
```

---

## 4. State Management Strategy

### 4.1 Local State (Default Choice)
**Use for**: Component-specific UI, forms, timer state

```typescript
// Timer state
const [timeMs, setTimeMs] = useState(0);
const [isRunning, setIsRunning] = useState(false);
```

### 4.2 Context (Global Concerns Only)

**AuthContext** - Authentication state + operations:
```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}
```

**ThemeContext** - Light/dark mode preference:
```typescript
interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}
```

### 4.3 Server State (useAsync Hook)

**Pattern**: Fetch data via services, manage loading/error states

```typescript
// Existing useAsync hook (src/hooks/useAsync.ts)
const { data: solves, loading, error, execute: refetch } = useAsync(
  () => solveService.getUserSolves({ limit: 50, offset: 0 })
);
```

### 4.4 What We're NOT Using
- ❌ Redux/Zustand - Overkill for MVP
- ❌ React Query - useAsync covers needs for now
- ❌ Global solve state - Fetch fresh per page (simple)

**Future Migration Path**: Add React Query if caching/optimistic updates become critical.

---

## 5. Service Layer

### 5.1 Services to Create

```
services/
├── authService.ts        # NEW - Supabase Auth wrapper
├── solveService.ts       # NEW - Solve CRUD operations
├── profileService.ts     # EXISTS - Expand with update methods
└── scrambleGenerator.ts  # NEW - WCA scramble generation (could be lib/)
```

### 5.2 Service Pattern Example

```typescript
// features/timer/services/solveService.ts
export const solveService = {
  create: async (command: CreateSolveCommand): Promise<SolveDTO> => {
    const { data, error } = await supabase
      .from('solves')
      .insert({ ...command })
      .select()
      .single();
    if (error) throw error;
    return data as SolveDTO;
  },

  getUserSolves: async (params: ListSolvesParams): Promise<PaginatedResponse<SolveDTO>> => {
    const { limit = 50, offset = 0 } = params;
    const { data, error, count } = await supabase
      .from('solves')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data as SolveDTO[], count: count ?? 0 };
  },

  updatePenalty: async (solveId: string, penalty: PenaltyType): Promise<void> => {
    const { error } = await supabase
      .from('solves')
      .update({ penalty_type: penalty })
      .eq('id', solveId);
    if (error) throw error;
  },

  deleteSolve: async (solveId: string): Promise<void> => {
    const { error } = await supabase
      .from('solves')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', solveId);
    if (error) throw error;
  },
};
```

**Service Guidelines**:
- Thin wrappers around Supabase calls
- No business logic (that's in hooks/components)
- Return strongly-typed DTOs from types.ts
- Throw errors (callers handle with useAsync)

---

## 6. Authentication Flow

### 6.1 AuthContext Implementation

```typescript
// shared/contexts/AuthContext.tsx
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
  };

  // ... logout, register methods

  return <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>;
}
```

### 6.2 Authentication Flows

**Registration**: Register → Email verification prompt → Verify email → Login → Timer

**Login**: Login form → Credentials → Success → Redirect to /timer (or original destination)

**Session Management**: Supabase handles JWT tokens, automatic refresh, persistence

---

## 7. Material UI Setup

### 7.1 Theme Configuration

```typescript
// shared/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark', // Speedcubers prefer dark mode
    primary: { main: '#00bcd4' }, // Cyan (cube-inspired)
    secondary: { main: '#ff6f00' }, // Orange
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontSize: '4rem', // Timer display
      fontWeight: 300,
      fontVariantNumeric: 'tabular-nums', // Monospace numbers
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' }, // Disable uppercase
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
```

### 7.2 App Integration

```typescript
// App.tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './shared/theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>{/* ... */}</Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 7.3 Key MUI Components to Use

**High-frequency**: Box, Grid2, Card, Typography, Button, TextField, Stack
**Medium**: Tabs, Dialog, Alert, Pagination, Switch, Chip
**Low but important**: AppBar, Toolbar, Drawer (mobile nav), Skeleton

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Install dependencies (MUI v7, React Router v7, Recharts)
2. Configure theme + auth context
3. Create routing structure
4. Build auth pages (Login, Register)
5. Implement ProtectedRoute

**Deliverable**: Users can register and log in

### Phase 2: Core Timer (Week 2)
6. Scramble generator (20-move 3x3)
7. Timer component (spacebar controls)
8. solveService (create, read)
9. Save solve to database
10. Display last 5 solves

**Deliverable**: Users can time solves with scrambles

### Phase 3: Statistics (Week 3)
11. Statistics calculation (Ao5, Ao12, Ao100, PB)
12. 3-panel layout (stats | timer | recent)
13. StatsCard components
14. Penalty system (+2, DNF, Delete)
15. Real-time stats updates

**Deliverable**: Users see stats and manage penalties

### Phase 4: History & Profile (Week 4)
16. History page with pagination
17. Profile page (settings, visibility toggle)
18. Public profile page (/u/:username)
19. Share profile button
20. Delete solves

**Deliverable**: Users review history and share profiles

### Phase 5: Analytics & Polish (Week 5)
21. ProgressChart (Recharts line chart)
22. DistributionChart (bar chart)
23. Password reset flow
24. Loading states + error handling
25. Responsive design refinement

**Deliverable**: Full MVP ready for launch

---

## 9. Key Technical Details

### 9.1 Statistics Calculation (Client-Side)

```typescript
// features/timer/lib/statistics.ts
export const calculateAo5 = (solves: SolveDTO[]): number | null => {
  if (solves.length < 5) return null;

  const times = solves.slice(-5).map(s => getEffectiveTime(s));
  if (times.includes(null)) return null; // DNF present

  const sorted = [...times].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, 4); // Remove best and worst
  return trimmed.reduce((sum, t) => sum + t, 0) / 3;
};

const getEffectiveTime = (solve: SolveDTO): number | null => {
  if (solve.penalty_type === 'DNF') return null;
  if (solve.penalty_type === '+2') return solve.time_ms + 2000;
  return solve.time_ms;
};
```

### 9.2 Timer Keyboard Controls

```typescript
// features/timer/hooks/useKeyboardTimer.ts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code !== 'Space' || e.repeat) return;
    e.preventDefault();

    if (state === 'idle') setPhase('countdown');
    else if (state === 'timing') stopTimer();
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code !== 'Space' || phase !== 'countdown') return;
    startTimer(); // Release spacebar = start
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [state, phase]);
```

### 9.3 Responsive Layout Breakpoints

```typescript
// 3-panel layout responsive behavior
<Grid2 container spacing={2}>
  <Grid2 xs={12} md={3}> {/* Left panel: hide on mobile */}
    <SessionStats />
  </Grid2>
  <Grid2 xs={12} md={6}> {/* Center: always visible */}
    <Timer />
  </Grid2>
  <Grid2 xs={12} md={3}> {/* Right panel: hide on mobile */}
    <RecentSolves />
  </Grid2>
</Grid2>
```

### 9.4 Error Handling Pattern

```typescript
// Consistent across all data fetching
const { data, loading, error, execute } = useAsync(fetchData);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorAlert message={error.message} onRetry={execute} />;
if (!data) return null;

return <DataDisplay data={data} />;
```

---

## 10. Dependencies to Install

```bash
npm install @mui/material@^7.0.0 @emotion/react @emotion/styled @mui/icons-material@^7.0.0
npm install react-router-dom@^7.0.0
npm install recharts@^2.15.0
```

---

## 11. Critical Files Reference

These files are essential for implementing this architecture:

1. **`src/types.ts`**
   - Comprehensive DTOs and command models already defined
   - Reference for all service signatures and component props
   - No changes needed, use as-is

2. **`src/hooks/useAsync.ts`**
   - Core data fetching pattern for entire app
   - All services consumed through this hook
   - Already complete and tested

3. **`src/services/profileService.ts`**
   - Pattern template for authService and solveService
   - Shows proper error handling, typing, Supabase integration
   - Expand with additional profile methods

4. **`src/db/supabase.ts`**
   - Single source of truth for Supabase client
   - All services import from here
   - Ensures consistent database access

5. **`.ai/prd.md`**
   - Complete feature requirements and acceptance criteria
   - Reference when building each feature
   - Guides priority and scope decisions

---

## 12. Success Criteria

This architecture succeeds if:

1. **Fast time-to-first-solve**: New user registers and records first solve in <5 minutes
2. **No prop drilling**: AuthContext eliminates passing user down 3+ levels
3. **Fast feature addition**: New stat (e.g., Ao50) can be added in <1 day
4. **Type safety**: All service calls fully typed (zero `any`)
5. **Simple mental model**: New developer understands structure in <15 minutes
6. **MVP delivery**: Complete implementation in 4-5 weeks

---

## 13. Future Scalability

**When to add complexity**:

- **React Query**: When caching becomes a problem or optimistic updates needed
- **Zustand**: When AuthContext becomes too complex or provider hell emerges
- **Storybook**: When team grows beyond 3 developers or design system needs docs
- **E2E Tests**: When critical bugs escape to production

**Migration paths are clear** - current architecture doesn't prevent future optimization.
