# Cubetive MVP - Remaining Work Summary

**Last Updated:** 2025-12-01

## Overview

This document outlines all critical functionalities still needed to release the Cubetive MVP. Based on a comprehensive review of the PRD and current implementation, the authentication and landing pages are ~95% complete, but the core timer feature and statistics remain largely unimplemented.

---

## Current Implementation Status

- **Authentication & Landing:** ~95% complete ✅
- **Profile Infrastructure:** ~60% complete 🟡
- **Timer Feature:** ~5% complete (placeholder only) ❌
- **Statistics:** ~0% complete ❌
- **Social Features:** ~0% complete ❌

**Total Implementation Files:** 54 TypeScript/React files

---

## Critical MVP Functionalities Still Missing

### 1. **Timer Feature** (CRITICAL - Core Value)

**Status:** Only placeholder page exists at `src/features/timer/pages/DashboardPage.tsx`

**Required Implementation:**

**Components & UI:**

- `TimerDisplay.tsx` - Large timer display with millisecond precision
- `TimerControls.tsx` - Spacebar control handler with WCA standards
- `ScrambleDisplay.tsx` - Display scramble notation
- `ScrambleGenerator.tsx` or integration with library (e.g., `scrambo`, `cstimer`)
- `PenaltyButtons.tsx` - DNF and +2 penalty controls
- `RecentSolvesList.tsx` - Display last 5-10 solves
- `SessionStats.tsx` - Current session Ao5, Ao12, PB

**Features:**

- ✅ Spacebar-activated start/stop mechanism (following WCA standards)
- ✅ Visual countdown/ready indicator (0.5s hold before start)
- ✅ Large, clearly visible time display during solve
- ✅ Automatic save of completed solve times
- ✅ Scramble generation (WCA-compliant 3x3, 20-move scrambles)
- ✅ Display of scramble notation in standard format
- ✅ New scramble generation after each solve
- ✅ DNF (Did Not Finish) marking capability
- ✅ +2 second penalty option for misaligned finishes
- ✅ Ability to modify penalties after solve completion
- ✅ Clear visual indicators for penalized solves

**Key User Stories:** US-006, US-007, US-008, US-009, US-010, US-011

**Files to Create:**

```
src/features/timer/
├── components/
│   ├── TimerDisplay.tsx
│   ├── TimerControls.tsx
│   ├── ScrambleDisplay.tsx
│   ├── PenaltyButtons.tsx
│   ├── RecentSolvesList.tsx
│   └── SessionStats.tsx
├── hooks/
│   ├── useTimer.ts
│   ├── useScramble.ts
│   └── useSolveManager.ts
├── services/
│   └── solvesService.ts
├── utils/
│   ├── scramble.ts
│   └── timerLogic.ts
└── types/
    └── timer.types.ts
```

---

### 2. **Solves Service Layer** (CRITICAL)

**Status:** Not implemented

**Required Implementation:**

Create `src/features/timer/services/solvesService.ts` with:

```typescript
// Save a new solve to the database
export async function saveSolve(
  userId: string,
  timeMs: number,
  scramble: string,
  penaltyType: 'DNF' | '+2' | null
): Promise<SolveDTO>;

// Fetch user's solve history with pagination
export async function getUserSolves(
  userId: string,
  limit?: number,
  offset?: number
): Promise<SolveDTO[]>;

// Get recent solves for statistics
export async function getRecentSolves(userId: string, count: number): Promise<SolveDTO[]>;

// Soft delete a solve
export async function deleteSolve(solveId: string): Promise<void>;

// Update solve penalty (DNF or +2)
export async function updateSolvePenalty(
  solveId: string,
  penaltyType: 'DNF' | '+2' | null
): Promise<void>;

// Get total solve count for user
export async function getSolveCount(userId: string): Promise<number>;
```

**Types to Create:**

```typescript
// src/features/timer/types/timer.types.ts
export interface SolveDTO {
  id: string;
  user_id: string;
  time_ms: number;
  scramble: string;
  penalty_type: 'DNF' | '+2' | null;
  created_at: string;
}

export interface SessionStats {
  currentAo5: number | null;
  currentAo12: number | null;
  sessionBest: number | null;
  sessionWorst: number | null;
  totalSolves: number;
}
```

---

### 3. **Statistics Calculations** (CRITICAL)

**Status:** Not implemented

**Required Implementation:**

Create `src/features/timer/utils/statistics.ts` with:

```typescript
// Calculate Average of 5 (excluding best and worst)
export function calculateAo5(solves: SolveDTO[]): number | null;

// Calculate Average of 12 (excluding best and worst)
export function calculateAo12(solves: SolveDTO[]): number | null;

// Calculate Average of 100 (excluding best 5 and worst 5)
export function calculateAo100(solves: SolveDTO[]): number | null;

// Find personal best single time
export function findPersonalBest(solves: SolveDTO[]): SolveDTO | null;

// Get effective time considering penalties
export function getEffectiveTime(solve: SolveDTO): number | 'DNF';

// Check if new solve is a personal best
export function isNewPersonalBest(newTime: number, currentPB: number | null): boolean;

// Calculate best Ao5 from all solves
export function findBestAo5(solves: SolveDTO[]): {
  average: number;
  solves: SolveDTO[];
  date: string;
} | null;

// Calculate best Ao12 from all solves
export function findBestAo12(solves: SolveDTO[]): {
  average: number;
  solves: SolveDTO[];
  date: string;
} | null;
```

**Business Rules:**

- DNF counts as worst time in averages
- More than 1 DNF in Ao5 = DNF average
- More than 1 DNF in Ao12 = DNF average
- +2 penalty adds 2000ms to time_ms
- Ao5: Use last 5 solves, exclude best and worst
- Ao12: Use last 12 solves, exclude best and worst
- Ao100: Use last 100 solves, exclude best 5 and worst 5

**Key User Stories:** US-012, US-013, US-016

---

### 4. **Profile Management Integration** (HIGH PRIORITY)

**Status:** UI exists but not connected to backend

**Current File:** `src/features/profile/pages/ProfilePage.tsx` (placeholder UI only)

**Required Implementation:**

**Service Methods to Add:**

Create `src/features/profile/services/profileService.ts` additions:

```typescript
// Update profile settings (username, visibility)
export async function updateProfileSettings(
  userId: string,
  updates: {
    username?: string;
    profile_visibility?: boolean;
  }
): Promise<void>;

// Update profile statistics after solve
export async function updateProfileStats(
  userId: string,
  stats: {
    total_solves?: number;
    pb_single?: number;
    pb_single_date?: string;
    pb_single_scramble?: string;
    pb_ao5?: number;
    pb_ao5_date?: string;
    pb_ao12?: number;
    pb_ao12_date?: string;
  }
): Promise<void>;

// Toggle profile visibility
export async function updateProfileVisibility(userId: string, isPublic: boolean): Promise<void>;
```

**Component Updates:**

Update `ProfilePage.tsx` to:

- ✅ Load profile data using `useCurrentProfile()` hook
- ✅ Display actual username, email, statistics
- ✅ Enable username change with validation
- ✅ Enable profile visibility toggle
- ✅ Show PB single, Ao5, Ao12, total solves in Statistics tab
- ✅ Add loading and error states
- ✅ Add success/error notifications for updates

**Key User Stories:** US-005, US-017

---

### 5. **Public Profile Sharing** (MEDIUM-HIGH PRIORITY)

**Status:** Not implemented

**Required Implementation:**

**New Route:** `/profile/:username` (public, no auth required)

**Files to Create:**

```
src/features/profile/
├── pages/
│   └── PublicProfilePage.tsx
├── services/
│   └── profileService.ts (add getPublicProfile method)
└── components/
    ├── PublicProfileCard.tsx
    └── RecentSolvesDisplay.tsx
```

**Service Method:**

```typescript
// Get public profile by username
export async function getPublicProfile(username: string): Promise<PublicProfileDTO | null>;

// PublicProfileDTO includes only public-safe data
export interface PublicProfileDTO {
  username: string;
  profile_visibility: boolean;
  pb_single: number | null;
  pb_ao5: number | null;
  total_solves: number;
  created_at: string;
  recent_solves: SolveDTO[]; // Last 10 solves
}
```

**Features:**

- ✅ Public profile loads without authentication
- ✅ Display username, join date
- ✅ Display best single time
- ✅ Display best Ao5
- ✅ Display recent 10 solves (time + date, no scramble for privacy)
- ✅ Show "Profile is private" message if `profile_visibility = false`
- ✅ Copy profile link button
- ✅ Clean, shareable URL format (`/profile/username`)

**Route Update:**

Add to `App.tsx`:

```typescript
<Route path="/profile/:username" element={<PublicProfilePage />} />
```

**Key User Stories:** US-018, US-019

---

### 6. **Solve History Page** (MEDIUM PRIORITY)

**Status:** Not implemented

**Required Implementation:**

**New Route:** `/history` (protected)

**Files to Create:**

```
src/features/timer/
├── pages/
│   └── HistoryPage.tsx
└── components/
    ├── SolveHistoryTable.tsx
    ├── SolveRow.tsx
    └── HistoryFilters.tsx
```

**Features:**

- ✅ Chronological solve list (newest first)
- ✅ Pagination (50 solves per page)
- ✅ Display for each solve:
  - Time (with penalty indicator)
  - Date and time
  - Scramble (collapsible or modal)
  - Delete button
- ✅ Bulk selection and deletion
- ✅ Total solve count display
- ✅ Date range filter (optional for MVP)
- ✅ Search by scramble (optional for MVP)

**Service Method:**

Already planned in `solvesService.ts`:

- `getUserSolves(userId, limit, offset)`
- `deleteSolve(solveId)`

**Key User Stories:** US-014

---

### 7. **Visual Analytics/Charts** (MEDIUM PRIORITY)

**Status:** Not implemented

**Required Implementation:**

**Option 1:** Add charts to Dashboard
**Option 2:** Create separate `/analytics` or `/statistics` page

**Files to Create:**

```
src/features/timer/
├── pages/
│   └── AnalyticsPage.tsx (or add to DashboardPage)
└── components/
    ├── ProgressChart.tsx
    ├── TrendChart.tsx
    └── StatsOverview.tsx
```

**Charting Library:**
Choose one:

- **Recharts** (recommended, React-friendly)
- **Chart.js** with react-chartjs-2
- **Victory** (lightweight)

**Features:**

- ✅ Line chart showing solve times over time
- ✅ Moving average trend line (Ao12 or Ao50)
- ✅ Date range filter (last 7 days, 30 days, all time)
- ✅ Interactive tooltips
- ✅ Responsive design
- ✅ Display alongside key stats (PB, current Ao5/Ao12)

**Data Processing:**

- Fetch solve history
- Calculate moving averages
- Format data for chart library
- Handle missing data gracefully

**Key User Stories:** US-015

---

### 8. **Profile Statistics Auto-Update** (CRITICAL for Data Integrity)

**Status:** Service methods exist but integration missing

**Required Implementation:**

**Logic Flow:**

After each solve is saved:

1. Calculate if new PB single
2. Fetch recent solves (last 5, 12, 100)
3. Calculate current Ao5, Ao12, Ao100
4. Compare with profile's best Ao5, Ao12
5. Update profile if new records
6. Increment `total_solves` counter

**Implementation:**

Create `src/features/timer/hooks/useSolveManager.ts`:

```typescript
export function useSolveManager() {
  const saveSolveWithStatsUpdate = async (
    timeMs: number,
    scramble: string,
    penaltyType: 'DNF' | '+2' | null
  ) => {
    // 1. Save solve to database
    const solve = await saveSolve(userId, timeMs, scramble, penaltyType);

    // 2. Fetch recent solves for stats
    const recentSolves = await getRecentSolves(userId, 100);

    // 3. Calculate statistics
    const newPB = findPersonalBest(recentSolves);
    const bestAo5 = findBestAo5(recentSolves);
    const bestAo12 = findBestAo12(recentSolves);

    // 4. Update profile statistics
    await updateProfileStats(userId, {
      total_solves: profile.total_solves + 1,
      pb_single: newPB?.time_ms,
      pb_single_date: newPB?.created_at,
      pb_single_scramble: newPB?.scramble,
      pb_ao5: bestAo5?.average,
      pb_ao5_date: bestAo5?.date,
      pb_ao12: bestAo12?.average,
      pb_ao12_date: bestAo12?.date,
    });

    // 5. Show celebration if new PB
    if (isNewPB) {
      showNotification('New Personal Best! 🎉');
    }
  };

  return { saveSolveWithStatsUpdate };
}
```

**Integration Point:** Call from timer after solve completion

---

### 9. **Storage Limit Management** (LOW-MEDIUM PRIORITY)

**Status:** Not implemented

**Required Implementation:**

**Display:**

- Show solve count: "X / 10,000 solves"
- Progress bar visual (optional)
- Warning banner at 9,500 solves

**Logic:**

```typescript
// In timer component
const solveCount = await getSolveCount(userId);

if (solveCount >= 10000) {
  // Prevent new solves OR auto-delete oldest
  showError('Solve limit reached. Please delete old solves to continue.');
}

if (solveCount >= 9500) {
  showWarning('Approaching solve limit (10,000). Consider deleting old solves.');
}
```

**Features:**

- ✅ Display current solve count and limit
- ✅ Warning at 9,500 solves
- ✅ Block new solves at 10,000 (or auto-delete oldest)
- ✅ Bulk delete functionality in History page
- ✅ "Delete solves older than..." option

**Key User Stories:** US-021

---

### 10. **Error Handling & Edge Cases** (ONGOING)

**Status:** Partial implementation

**Required Implementation:**

**Network Error Handling:**

```typescript
// In solvesService.ts
try {
  await saveSolve(userId, timeMs, scramble, penaltyType);
} catch (error) {
  if (error.message.includes('network')) {
    showError('Unable to save solve. Please check your connection.');
    // Store locally and retry later
  } else {
    showError('Failed to save solve. Please try again.');
  }
}
```

**Offline Indicator:**

- Show banner when offline
- Timer continues to work
- Queue solves for sync when back online

**Session Timeout:**

- Detect expired auth token
- Show re-authentication modal
- Preserve unsaved solve data

**Concurrent Sessions:**

- Handle data sync between multiple devices/tabs
- Show notification when data updates from another session

**User-Friendly Errors:**

- Map Supabase error codes to readable messages
- Don't expose raw database errors
- Provide actionable next steps

**Key User Stories:** US-022, US-023, US-024

---

## Priority Breakdown for MVP Release

### **Phase 1 - Core Timer (Weeks 1-2)** 🔥 CRITICAL

**Goal:** Users can time solves and save them

1. ✅ Timer interface with spacebar controls (`TimerDisplay.tsx`, `TimerControls.tsx`)
2. ✅ Scramble generation integration (`useScramble.ts`, choose library)
3. ✅ Solve save functionality (`solvesService.ts` + database integration)
4. ✅ Basic statistics calculations (`statistics.ts` - Ao5, Ao12, PB)
5. ✅ Penalty system (`PenaltyButtons.tsx`, DNF/+2 logic)
6. ✅ Recent solves display (`RecentSolvesList.tsx`)

**Deliverables:**

- Working timer on `/dashboard`
- Solves saved to database
- Display current session stats (Ao5, Ao12, PB)

**Acceptance Criteria:**

- User can start timer with spacebar
- Scramble appears before each solve
- Time saves automatically after completion
- DNF and +2 penalties work correctly
- Session stats update in real-time

---

### **Phase 2 - Profile & Data Display (Weeks 3-4)** 📊

**Goal:** Users can view and manage their data

1. ✅ Profile page integration with real data (`ProfilePage.tsx` update)
2. ✅ Profile settings (username, visibility toggle)
3. ✅ Profile statistics display (PB, Ao5, Ao12, total solves)
4. ✅ Profile statistics auto-update after solves (`useSolveManager.ts`)
5. ✅ Solve history page with pagination (`HistoryPage.tsx`)
6. ✅ Delete solve functionality

**Deliverables:**

- Functional profile management at `/profile`
- Profile stats update automatically
- Solve history viewable at `/history`

**Acceptance Criteria:**

- Profile shows real username and stats
- Username can be changed (with validation)
- Profile visibility can be toggled
- Solve history shows all past solves
- Solves can be deleted individually

---

### **Phase 3 - Social & Polish (Weeks 5-6)** 🌐

**Goal:** Users can share profiles and visualize progress

1. ✅ Public profile page implementation (`PublicProfilePage.tsx`)
2. ✅ Public profile service methods (`getPublicProfile`)
3. ✅ Profile sharing functionality (copy link button)
4. ✅ Visual charts/analytics (`ProgressChart.tsx`, choose library)
5. ✅ Storage limit warnings (solve count display)
6. ✅ Error handling improvements
7. ✅ Loading states and animations
8. ✅ Success notifications (new PB, etc.)

**Deliverables:**

- Public profiles viewable at `/profile/:username`
- Visual progress charts
- Polished UX with proper feedback

**Acceptance Criteria:**

- Public profiles work without authentication
- Profile link can be copied and shared
- Charts display solve progression
- User gets notifications for new PBs
- Storage limit warnings appear appropriately

---

## Testing Requirements Before Launch

### **Unit Tests**

- ✅ Statistics calculations (`statistics.test.ts`)
  - Ao5 with various scenarios
  - Ao12 with DNF handling
  - PB detection
  - Edge cases (less than 5 solves, all DNFs, etc.)
- ✅ Timer logic (`timerLogic.test.ts`)
- ✅ Service methods (`solvesService.test.ts`, `profileService.test.ts`)

### **E2E Tests**

- ✅ Timer flow: start → solve → save → display
- ✅ Penalty application: DNF and +2
- ✅ Profile updates: username change, visibility toggle
- ✅ Public profile sharing: view public profile, private profile handling
- ✅ Solve deletion: single delete, history update
- ✅ Authentication edge cases: session timeout, re-login

### **Manual Testing**

- ✅ Multiple browsers (Chrome, Firefox, Safari, Edge)
- ✅ Different screen sizes (desktop, tablet, mobile view)
- ✅ Network conditions (slow 3G, offline, reconnect)
- ✅ Concurrent sessions (multiple tabs, multiple devices)
- ✅ Performance testing:
  - Timer precision (<10ms variance)
  - Page load times (<3 seconds)
  - Chart render time (<500ms)

### **User Acceptance Testing**

- ✅ Complete user journey: signup → verify → time solves → view stats → share profile
- ✅ Edge cases: 0 solves, 1 solve, 10,000 solves
- ✅ Error scenarios: network failure, invalid input, expired session

---

## Dependencies & Libraries to Add

### **Scramble Generation**

Choose one:

- **scrambo** (npm package, WCA-compliant) ⭐ Recommended
- **cstimer** (port scramble generation code)
- **tnoodle** (requires Java backend - avoid for MVP)

```bash
npm install scrambo
```

### **Charting Library**

Choose one:

- **Recharts** (React-friendly, composable) ⭐ Recommended
- **Chart.js** with react-chartjs-2
- **Victory** (lightweight)

```bash
npm install recharts
```

### **Optional**

- **react-toastify** - Toast notifications for PBs and errors
- **date-fns** - Date formatting in history and charts

```bash
npm install react-toastify date-fns
```

---

## Database Considerations

### **Current Schema Status**

✅ Migration exists: `supabase/migrations/001_initial_schema.sql`

- `profiles` table with statistics columns
- `solves` table with penalty support
- RLS policies configured
- Triggers for profile creation and updated_at

### **Required Indexes (Already in Migration)**

- ✅ `idx_solves_user_id` - Fast solve queries by user
- ✅ `idx_solves_user_created` - Chronological solve retrieval
- ✅ `idx_profiles_username` - Public profile lookups
- ✅ `idx_profiles_visibility` - Public profile filtering

### **Data Integrity**

- Soft deletes via `deleted_at` column
- Constraints on penalty types (`'+2'`, `'DNF'`, `NULL`)
- Foreign key: `solves.user_id` → `auth.users(id)`

---

## Performance Considerations

### **Timer Precision**

- Use `performance.now()` for high-resolution timestamps
- Store times in milliseconds (INTEGER in database)
- Display with 2 decimal places (e.g., "12.45s")

### **Statistics Calculation**

- Calculate client-side (not in database queries)
- Cache recent solves in component state
- Only recalculate when new solve added

### **Profile Updates**

- Batch statistics updates (single query)
- Optimistic UI updates (update UI before DB confirm)
- Debounce rapid updates if needed

### **History Pagination**

- Fetch 50 solves per page
- Infinite scroll (optional) vs. page numbers
- Index on `created_at` for fast queries

---

## Success Metrics (From PRD)

### **Primary KPIs**

1. ✅ **90% of registered users have at least one solve time saved**
   - Metric: Count of users with `total_solves > 0` / Total registered users
   - Measurement: 30 days post-registration

2. ✅ **30% of active users have public profiles**
   - Metric: Public profiles / Active users (logged in last 30 days)
   - Measurement: Monthly after 3 months post-launch

### **Secondary KPIs**

- **User Retention:** 60% return within 7 days of registration
- **Solving Activity:** Average 20 solves per active user per week
- **Profile Engagement:** Public profiles receive average of 5 views per week

### **Performance Metrics**

- **Timer Accuracy:** <10ms variance from true time
- **Page Load Speed:** <3 seconds on 3G connection
- **API Response Time:** <200ms for 95th percentile
- **Uptime:** 99.9% availability

---

## Estimated Completion Time

### **Current Progress**

- **Authentication & Landing:** ~95% complete ✅
- **Profile Infrastructure:** ~60% complete 🟡
- **Timer Feature:** ~5% complete (placeholder only) ❌
- **Statistics:** ~0% complete ❌
- **Social Features:** ~0% complete ❌

### **Realistic MVP Timeline**

**Full-time development (40 hrs/week):**

- Phase 1: 2 weeks
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Testing & Polish: 1 week
- **Total: 7 weeks**

**Part-time development (20 hrs/week):**

- Phase 1: 4 weeks
- Phase 2: 4 weeks
- Phase 3: 3 weeks
- Testing & Polish: 2 weeks
- **Total: 13 weeks (~3 months)**

### **Critical Path**

The **timer feature with statistics** is the most critical missing piece and represents the core value proposition. Without it, the application provides no value to users beyond basic account management.

**Recommendation:** Focus 100% on Phase 1 (Core Timer) before moving to other features. A working timer is better than a polished but incomplete application.

---

## Risk Assessment

### **High Risk**

1. **Timer precision** - Requires careful implementation to meet <10ms variance
2. **Statistics accuracy** - Complex logic with edge cases (DNF handling)
3. **Scramble generation** - Must be WCA-compliant and random

### **Medium Risk**

1. **Performance at scale** - 10,000 solves per user could slow queries
2. **Concurrent session sync** - Data conflicts between devices
3. **Chart rendering** - Large datasets may slow down page

### **Low Risk**

1. **Public profile implementation** - Straightforward read-only views
2. **Profile settings** - Simple CRUD operations
3. **UI polish** - Iterative improvement process

---

## Open Questions

1. **Scramble Library:** Which library to use for scramble generation?
   - Recommendation: `scrambo` (npm package, actively maintained)

2. **Chart Library:** Which charting library fits best?
   - Recommendation: Recharts (best React integration)

3. **Notification System:** Toast notifications or inline alerts?
   - Recommendation: React-toastify for non-blocking feedback

4. **History Pagination:** Infinite scroll or page numbers?
   - Recommendation: Page numbers (simpler, more predictable)

5. **Analytics Page:** Separate route or part of dashboard?
   - Recommendation: Separate `/analytics` route (cleaner separation)

6. **Mobile Support:** Should timer work on mobile or view-only?
   - Per PRD: View-only for MVP, optimize for desktop solving

---

## Conclusion

The MVP is **well-positioned** with solid authentication and infrastructure, but requires **significant work** on the core timer feature and statistics system.

**Next immediate steps:**

1. Choose and integrate scramble library (`scrambo`)
2. Implement timer controls with spacebar logic
3. Create `solvesService.ts` and save solve functionality
4. Implement statistics calculations (`statistics.ts`)
5. Connect everything in the Dashboard page

**Estimated time to MVP launch:** 4-6 weeks of focused development (full-time) or 10-13 weeks (part-time).

The foundation is strong—now it's time to build the core experience that delivers value to speedcubers. 🎯
