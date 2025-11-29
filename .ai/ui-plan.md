# UI Architecture for Cubetive

## 1. UI Structure Overview

Cubetive's UI architecture is designed around a **single-page application (SPA)** model with distinct functional zones optimized for speedcubing practice. The architecture prioritizes:

- **Focused timer experience**: 3-panel inline layout (stats | timer | recent solves) that keeps all critical information visible during practice sessions
- **Progressive disclosure**: Complex features (full history, analytics) accessed through dedicated pages to avoid overwhelming users
- **Keyboard-first interaction**: Timer controls via spacebar following WCA standards, with all features accessible via keyboard navigation
- **Responsive design**: Desktop-optimized with mobile-friendly fallback for viewing statistics on-the-go

The application uses **feature-based routing** with public and protected routes, Material UI v7 for consistent design, and React Router v7 for navigation. Authentication state is managed globally via AuthContext, while other state remains colocated with features.

**Core User Flows**:
1. **Anonymous visitor** → Landing page → Register → Email verification → Login → Timer
2. **Authenticated user** → Timer (default) → Record solves → View statistics → Manage history → Share profile
3. **Public profile visitor** → Direct URL → View achievements (no auth required)

---

## 2. View List

### 2.1 Landing Page (`/`)

**Main Purpose**: Convert visitors to registered users by showcasing value proposition and providing clear entry points

**Key Information to Display**:
- Hero section with tagline: "Track, Analyze, and Share Your Speedcubing Progress"
- Feature highlights (WCA-standard timer, comprehensive statistics, public profiles)
- Sample timer visualization or demo
- Clear call-to-action buttons (Sign Up, Login)
- Social proof section (future: user testimonials, solve count)

**Key View Components**:
- `Hero` - Value proposition and primary CTAs
- `FeatureGrid` - 3-column grid showcasing timer, stats, and social features
- `DemoSection` - Interactive or visual demo of timer interface
- `Footer` - Links to documentation, privacy policy, GitHub

**UX, Accessibility, and Security Considerations**:
- High contrast text for readability (WCAG AA)
- Skip link to main content
- Animated scramble visualization to engage cubing community
- No PII collected on landing page (privacy-first)
- Optimized loading (< 3 seconds on 3G as per FR-012)

---

### 2.2 Registration Page (`/register`)

**Main Purpose**: Create new user account with email verification workflow

**Key Information to Display**:
- Registration form (email, password, confirm password)
- Password requirements (8+ characters as per FR-004)
- Real-time password strength indicator
- Email verification explanation
- Terms of service agreement checkbox
- Link to login page for existing users

**Key View Components**:
- `RegisterForm` - Email/password inputs with validation
- `PasswordStrengthMeter` - Visual indicator of password complexity
- `ValidationMessage` - Inline error messages
- `SuccessAlert` - "Verification email sent" confirmation

**UX, Accessibility, and Security Considerations**:
- Form labels properly associated with inputs (aria-labelledby)
- Error messages announced to screen readers (aria-live)
- Password visibility toggle (eye icon)
- Client-side validation before submission (reduce round-trips)
- Generic error messages for duplicate emails (prevent email enumeration)
- Auto-focus email field on load
- Disabled submit button during processing (prevent double-submit)

---

### 2.3 Login Page (`/login`)

**Main Purpose**: Authenticate existing users and redirect to timer dashboard

**Key Information to Display**:
- Login form (email, password)
- "Remember me" checkbox (extends session to 30 days as per US-003)
- Password reset link
- Registration link for new users
- Error messages for invalid credentials (generic message as per US-003)

**Key View Components**:
- `LoginForm` - Email/password inputs
- `RememberMeCheckbox` - Session persistence toggle
- `ErrorAlert` - Authentication error display
- `LoadingSpinner` - Submission state indicator

**UX, Accessibility, and Security Considerations**:
- Password masking by default with toggle
- Preserve "from" location for post-login redirect (see section 3.2)
- Generic error: "Invalid email or password" (prevent user enumeration)
- Tab order: Email → Password → Remember Me → Submit
- Enter key submits form from any field
- Focus management: first field on load, error message on failure

---

### 2.4 Password Reset Page (`/reset-password`)

**Main Purpose**: Allow users to recover account access via email

**Key Information to Display**:
- Email input for reset request
- Instructions: "Enter your email to receive a password reset link"
- Success message: "If an account exists, reset email sent" (generic for security as per US-004)
- Link back to login page
- Reset link expiration notice (1 hour as per US-004)

**Key View Components**:
- `PasswordResetForm` - Email input
- `InfoAlert` - Instructions and security notice
- `SuccessAlert` - Confirmation message
- `NewPasswordForm` - Displayed after clicking reset link (password + confirm)

**UX, Accessibility, and Security Considerations**:
- Always show success message (even if email doesn't exist)
- Clear expiration time for reset links (1 hour as per US-004)
- Password requirements displayed during new password entry
- Visual confirmation when password successfully reset
- Automatic redirect to login after successful reset
- All active sessions terminated after password change (as per US-004)

---

### 2.5 Timer Page (`/timer`) - Primary Application View

**Main Purpose**: Enable users to practice solves with WCA-standard timing, view real-time statistics, and access recent solve history in a unified interface

**View Path**: `/timer` (default authenticated route)

**Key Information to Display**:

**Left Panel - Session Statistics**:
- Current session metrics (Ao5, Ao12, session best, session mean)
- Personal bests (PB single, best Ao5, best Ao12 with dates)
- Total solve count and session solve count

**Center Panel - Timer Interface**:
- Current scramble (monospace, 18px, standard WCA notation)
- Timer display (huge font, tabular numbers for alignment)
- Timer state indicator (idle/ready/timing with color coding)
- Instructions: "Press and hold spacebar to start"
- Post-solve penalty controls (+2, DNF, Delete buttons)

**Right Panel - Recent Solves**:
- Last 12 solves in chronological order (newest first)
- Each solve showing: time, penalty indicator, timestamp
- Visual highlight for session best/worst
- Truncated list with link to full history

**Key View Components**:
- `Grid2` (Material UI) - 3-column responsive layout (25% | 50% | 25%)
- `SessionStatsCard` - Current session metrics
- `PersonalBestsCard` - All-time records
- `Timer` - Large time display with state-based styling
- `Scramble` - Monospace notation display
- `TimerInstructions` - Contextual guidance based on timer state
- `PenaltyControls` - Button group for solve adjustments
- `RecentSolvesList` - Scrollable list of latest solves
- `SolveListItem` - Individual solve with time, penalty, relative timestamp

**UX, Accessibility, and Security Considerations**:
- **Keyboard-first**: Spacebar controls (0.5s hold → green ready state → release to start → press to stop as per US-008)
- **Visual feedback**: Color-coded timer states (idle: default, ready: green, timing: accent color)
- **Screen reader announcements**: "Timer ready", "Timer started", "Time: 12.45 seconds"
- **Focus trap**: Timer maintains focus during solving (prevents accidental navigation)
- **Responsive behavior**: Mobile stacks vertically (Timer → Stats → Recent Solves)
- **Performance**: Timer updates at 60fps, statistics recalculate < 50ms
- **Error handling**: Network failures during save show retry option without losing solve data
- **Shortcut hints**: Visible instructions for spacebar, +2 (keyboard shortcut), DNF (keyboard shortcut)

**Navigation Elements**:
- Top app bar with logo, navigation links (Timer, History, Analytics, Profile), user menu
- Active route highlighted in navigation
- User avatar with dropdown (Settings, Logout)

---

### 2.6 History Page (`/history`)

**Main Purpose**: Browse complete solve history with filtering, pagination, and bulk management tools

**View Path**: `/history`

**Key Information to Display**:
- Complete solve list (paginated, 50 per page as per US-014)
- Each solve: time, scramble, date/time, penalty status
- Total solve count and current page indicator
- Filters: Date range, penalty type, time range
- Bulk actions: Select multiple solves, bulk delete
- Sort options: Newest first (default), oldest first, fastest, slowest

**Key View Components**:
- `HistoryFilters` - Date picker, penalty checkboxes, time range sliders
- `SolveTable` - Data table with sortable columns
- `SolveRow` - Expandable row showing full scramble, edit/delete actions
- `Pagination` - Page navigation controls (Material UI)
- `BulkActionBar` - Appears when solves selected (Delete, Export in future)
- `SolveDetailDialog` - Modal for viewing full solve details
- `DeleteConfirmationDialog` - "Are you sure?" modal (prevent accidental deletion as per US-011)

**UX, Accessibility, and Security Considerations**:
- Checkbox column for row selection (keyboard accessible via Space key)
- Expandable rows for scramble details (avoid cluttered table)
- Deletion requires confirmation dialog (US-011)
- Visual indication for penalized solves (red for DNF, yellow for +2)
- Keyboard navigation: Arrow keys navigate rows, Enter opens detail
- Screen reader: Row headers and table caption properly labeled
- Loading skeleton during pagination (prevent layout shift)
- URL state for filters (shareable filtered views)
- Optimistic updates: Deleted solves fade out immediately, undo option

---

### 2.7 Analytics Page (`/analytics`)

**Main Purpose**: Visualize progress trends and performance distribution through interactive charts

**View Path**: `/analytics`

**Key Information to Display**:
- Progress line chart (solve times over time with moving average trend line as per US-015)
- Time distribution bar chart (histogram of solve times)
- Session comparison chart (compare different practice sessions)
- Key statistics summary cards (all-time average, improvement rate, consistency score)
- Date range selector (last 7 days, 30 days, 90 days, all time, custom)
- Chart export options (future: PNG, SVG)

**Key View Components**:
- `DateRangePicker` - Quick filters + custom range selector
- `ProgressChart` (Recharts LineChart) - Solve times with trend line
- `DistributionChart` (Recharts BarChart) - Time frequency histogram
- `StatsCard` - Metric display with icon and change indicator (+/- from previous period)
- `ChartLegend` - Interactive legend for toggling data series
- `ChartTooltip` - Hover details for data points
- `EmptyState` - "Not enough data" message for < 12 solves

**UX, Accessibility, and Security Considerations**:
- Responsive charts (Recharts' ResponsiveContainer)
- Accessible color palette (colorblind-friendly)
- Chart tooltips show full date/time and solve details
- Keyboard navigation: Tab through chart series, Enter toggles visibility
- ARIA labels for all chart elements
- Loading skeletons during data fetching
- Progressive enhancement: Show statistics even if charts fail to load
- Y-axis starts at 0 for honest visualization (no misleading scales)
- Trend line calculation transparent (moving average algorithm visible in help text)

---

### 2.8 Profile Settings Page (`/profile`)

**Main Purpose**: Manage user account settings, preferences, and profile visibility

**View Path**: `/profile`

**Key Information to Display**:
- Current username with edit option
- Profile visibility toggle (public/private as per US-017)
- Public profile URL (if public) with copy button
- Email address (read-only, cannot be changed)
- Password change section (requires current password)
- Account statistics (total solves, account age, join date)
- Danger zone: Account deletion button

**Key View Components**:
- `UsernameEditForm` - Text field with validation (3-30 chars, alphanumeric + underscore/hyphen as per API plan)
- `VisibilityToggle` - Switch with explanation modal ("What will be shared?")
- `ProfileURLDisplay` - Read-only URL with copy button and success toast
- `EmailDisplay` - Read-only email address display (cannot be edited)
- `PasswordChangeForm` - Current password, new password, confirm fields
- `AccountStatsCard` - Read-only display of account metrics
- `DeleteAccountDialog` - Multi-step confirmation with warning text
- `SuccessSnackbar` - Temporary confirmation messages for saves

**UX, Accessibility, and Security Considerations**:
- Clear explanation of public profile visibility (modal with preview)
- Username uniqueness validation on blur (API check)
- Password change requires current password (prevent session hijacking)
- Email is displayed as read-only (cannot be changed by users)
- Delete account requires typing "DELETE" to confirm (prevent accidents)
- All settings saved with explicit save button (no auto-save for account changes)
- Toast notifications for successful changes
- Form validation matches backend rules (prevent failed submissions)
- Disabled states for fields during save operations

---

### 2.9 Public Profile Page (`/u/:username`)

**Main Purpose**: Display user achievements and recent activity to anyone with the link (no authentication required)

**View Path**: `/u/:username`

**Key Information to Display**:
- Username and join date (as per US-018)
- Personal bests: PB single, best Ao5, best Ao12
- Total solve count
- Recent activity feed (last 10 solves with times and dates as per US-018)
- Profile visibility status (if private: "This profile is private" message)
- Visual badges for achievements (future)

**Key View Components**:
- `PublicProfileHeader` - Username, avatar (future), join date
- `AchievementsCard` - Grid of personal bests with icons
- `RecentActivityFeed` - Timeline of last 10 solves
- `SolveActivityItem` - Individual solve with time, penalty, relative date
- `PrivateProfileMessage` - Full-page message for private profiles
- `NotFoundMessage` - "User not found" for non-existent usernames
- `ShareButton` - Copy profile URL (future: QR code as per US-019)

**UX, Accessibility, and Security Considerations**:
- No authentication required (public route)
- RLS policies enforce visibility rules at database level
- Private profiles return 200 with "Private" message (not 404 to prevent user enumeration)
- Semantic HTML for profile sections (article, section tags)
- OpenGraph meta tags for social sharing (preview cards on Discord, Twitter)
- Shareable URL format: `/u/username` (clean, memorable as per US-019)
- Copy link button with success feedback
- Responsive design for mobile sharing
- No sensitive information exposed (only what user explicitly made public)
- Analytics tracking disabled for privacy (future consideration)

---

### 2.10 Email Verification Page (`/verify-email`)

**Main Purpose**: Confirm email address via magic link from registration email

**View Path**: `/verify-email?token=xyz`

**Key Information to Display**:
- Verification status: Processing → Success or Error
- Success: "Email verified! You can now log in."
- Error: "Invalid or expired link. Request a new one."
- Call-to-action: Login button (success) or Resend verification (error)
- Link expiration info (24 hours as per US-002)

**Key View Components**:
- `VerificationSpinner` - Loading state during token validation
- `SuccessMessage` - Checkmark icon + confirmation + CTA
- `ErrorMessage` - Error icon + explanation + resend option
- `ResendVerificationButton` - Request new verification email

**UX, Accessibility, and Security Considerations**:
- Automatic verification on page load (no manual action required)
- Clear error messages for expired/invalid tokens
- Single-use tokens (prevent replay attacks)
- Redirect to login after 3 seconds on success (with skip link)
- Resend verification rate-limited (prevent abuse)
- Focus management: Success message receives focus for screen readers

---

### 2.11 Not Found Page (`/404` or `*`)

**Main Purpose**: Handle invalid routes gracefully and guide users back to valid pages

**View Path**: Any unmatched route

**Key Information to Display**:
- 404 error message: "Page not found"
- Friendly explanation: "The page you're looking for doesn't exist"
- Suggested actions: Return to timer, go to homepage, search (future)
- Navigation breadcrumb showing broken path
- Site navigation links (header still visible)

**Key View Components**:
- `NotFoundIllustration` - Cube-themed 404 graphic
- `ErrorMessage` - Clear explanation
- `NavigationSuggestions` - Button group (Home, Timer, Profile)
- `Header` - Full site navigation remains accessible

**UX, Accessibility, and Security Considerations**:
- HTTP 404 status properly set (SEO)
- Maintains application shell (header, footer)
- Suggested actions based on authentication state (logged in → Timer, logged out → Login)
- No auto-redirect (gives user control)
- Accessible focus management

---

## 3. User Journey Map

### 3.1 New User Onboarding Journey

**Step 1: Discovery (Landing Page)**
- User arrives at `/` via search, social media, or direct link
- Scans hero section and feature highlights
- Reads value proposition: "Track, Analyze, and Share Your Speedcubing Progress"
- **Decision point**: Sign up vs. Explore demo (future)
- **Action**: Clicks "Sign Up" button

**Step 2: Registration**
- Navigates to `/register`
- Fills email and password fields
- Receives inline validation feedback (password strength, email format)
- Submits form
- Sees success message: "Verification email sent to [email]"
- **Action**: Opens email client

**Step 3: Email Verification**
- Receives verification email (within 1 minute as per US-002)
- Clicks verification link
- Redirected to `/verify-email?token=...`
- Sees "Email verified!" success message
- Automatically redirected to login page after 3 seconds
- **Action**: Proceeds to login

**Step 4: First Login**
- Arrives at `/login` (either from auto-redirect or manual navigation)
- Enters email and password
- Optionally checks "Remember me"
- Submits form
- Redirected to `/timer` (default post-login destination)
- **Milestone**: First authenticated session started

**Step 5: First Solve**
- Lands on `/timer` with 3-panel layout
- Reads scramble notation displayed
- Sees instructions: "Press and hold spacebar to start"
- Holds spacebar → Timer turns green (ready state)
- Releases spacebar → Timer starts counting
- Solves cube → Presses spacebar to stop
- Timer displays final time
- Sees penalty controls (+2, DNF, Delete) below timer
- **Action**: Accepts time (does nothing) or applies penalty
- Solve automatically saved to database

**Step 6: Statistics Discovery**
- Notices left panel now shows "Current Ao5: N/A (need 5 solves)"
- Sees right panel displays last solve in "Recent Solves" list
- Continues solving to reach 5 solves
- After 5th solve, Ao5 appears: "Current Ao5: 15.23"
- Notices personal best indicators updating
- **Insight**: Realizes statistics are calculated automatically

**Step 7: History Exploration**
- Clicks "History" in top navigation
- Sees paginated table of all solves with times, scrambles, dates
- Experiments with filters (date range, penalty type)
- Clicks on a solve to see full scramble
- Discovers delete functionality with confirmation dialog
- **Comfort**: Understands data persistence and control

**Step 8: Profile Setup**
- Navigates to `/profile` via user menu in top-right
- Sets unique username
- Toggles profile visibility to "Public"
- Sees shareable URL appear: `cubetive.app/u/username`
- Clicks "Copy Link" button
- Receives confirmation toast: "Link copied!"
- **Milestone**: Profile ready for sharing

**Step 9: Sharing Achievement**
- Returns to `/timer` to continue practicing
- Achieves new personal best (visual celebration animation)
- Navigates back to `/profile`
- Copies public profile URL
- Shares link on Reddit, Discord, or with friends
- Friends view public profile at `/u/username` (no login required)
- **Success**: Social validation achieved

---

### 3.2 Returning User Journey

**Step 1: Return Visit**
- Arrives at `cubetive.app`
- If "Remember me" enabled: Automatically authenticated → Redirected to `/timer`
- If session expired: Sees login page → Enters credentials → Redirected to `/timer`

**Step 2: Daily Practice Session**
- Lands on `/timer` with previous session visible
- Starts solving immediately (familiar interface, no learning curve)
- Completes 20-30 solves in session
- Monitors stats in real-time (left panel updates after each solve)
- Applies penalties when needed (keyboard shortcuts for speed)
- **Flow state**: Uninterrupted practice

**Step 3: Progress Review**
- After session, navigates to `/analytics`
- Views progress chart showing improvement trend
- Compares today's average to last week
- Identifies consistency issues in distribution chart
- **Insight**: Data-driven training decisions

**Step 4: History Management**
- Periodically navigates to `/history`
- Reviews old solves and scrambles
- Deletes outliers or mistakes
- Statistics automatically recalculate after deletions
- **Maintenance**: Keeps data clean

---

### 3.3 Public Profile Visitor Journey

**Step 1: Arrival**
- Receives shared link: `cubetive.app/u/speedcuber123`
- Clicks link (no authentication required)
- Loads public profile page

**Step 2: Achievement Viewing**
- Sees username and join date
- Reviews personal bests (PB single: 9.80s, Best Ao5: 11.20s)
- Scrolls through recent activity (last 10 solves)
- **Impression**: User is legitimately skilled

**Step 3: Inspiration or Comparison**
- Compares visitor's own times to shared profile
- Feels inspired to improve or validated in progress
- **Decision point**: Sign up to track own progress
- Clicks "Sign Up" in header (if not authenticated)
- Enters onboarding journey (see 3.1)

---

### 3.4 Error Recovery Journeys

**Network Interruption During Solve**
1. User completes solve while offline
2. Timer stops and displays time locally
3. Save attempt fails (network error)
4. Error alert appears: "Failed to save solve. Retry?"
5. User clicks "Retry" button
6. Solve successfully saved when connection restored
7. Statistics update, success toast appears
8. **Outcome**: No data loss, user retains trust

**Session Timeout During Practice**
1. User practices for extended period (> 1 hour)
2. Session expires (JWT timeout)
3. User completes next solve
4. Save fails with 401 Unauthorized
5. Modal appears: "Session expired. Please log in again."
6. Login form embedded in modal (current page preserved)
7. User enters credentials
8. Modal closes, original page context restored
9. Failed solve automatically retries save
10. **Outcome**: Minimal interruption (as per US-023)

**Invalid Public Profile Access**
1. User navigates to `/u/nonexistentuser`
2. Page loads (no redirect)
3. Shows: "User not found or profile is private"
4. Suggests: "Check the URL or explore other public profiles"
5. **Outcome**: Security preserved (no user enumeration)

---

## 4. Layout and Navigation Structure

### 4.1 Application Shell

**Top App Bar** (persistent across all authenticated views):
- **Left section**: Logo (clickable, returns to `/timer`)
- **Center section**: Primary navigation links
  - Timer (default/home)
  - History
  - Analytics
  - Profile
- **Right section**: User menu
  - Avatar with username (dropdown trigger)
  - Dropdown items: Settings, Logout
- **Height**: 64px (Material UI default)
- **Behavior**: Fixed position on desktop, hidden on mobile timer view (full-screen focus)

**Mobile Navigation** (< 768px):
- Hamburger menu icon (left side) opens drawer
- Drawer contains: Timer, History, Analytics, Profile, Settings, Logout
- Timer view hides app bar by default (tap header to reveal)
- Other views show persistent app bar

**Footer** (only on public pages: landing, login, register):
- Copyright notice
- Links: Privacy Policy, Terms of Service, GitHub, Documentation
- Social links (future)

---

### 4.2 Navigation Patterns

**Primary Navigation**: Top app bar links
- **Active state**: Underline or highlight on current route
- **Hover state**: Background color change
- **Keyboard**: Tab to navigate, Enter to select
- **Screen reader**: `<nav aria-label="Primary navigation">`

**User Menu Navigation**: Dropdown (Material UI Menu)
- Triggered by clicking avatar/username
- Keyboard: Arrow keys navigate items, Enter selects
- Closes on selection or Escape key
- Contains: Profile Settings, Logout

**Breadcrumb Navigation** (future consideration for nested views):
- Not needed for MVP (flat navigation structure)
- Consider for future: Analytics → Session Detail → Solve Detail

**Direct URL Navigation**:
- All routes are bookmarkable
- Public profiles have clean URLs: `/u/username`
- Query parameters preserve filter state: `/history?date=2025-01&penalty=+2`

---

### 4.3 Navigation Flow Diagram

```
Landing Page (/)
├─ Login (/login) → Timer (/timer)
├─ Register (/register) → Verify Email → Login → Timer
└─ Public Profile (/u/:username) → [View only]

Authenticated App Shell (with Top App Bar)
├─ Timer (/timer) [DEFAULT] ← Primary practice hub
│   └─ Quick actions: Apply penalty, Delete solve
├─ History (/history)
│   └─ Pagination → Page 2, 3, ...
├─ Analytics (/analytics)
│   └─ Date range selection (in-page filters)
└─ Profile (/profile)
    └─ Edit username, Change password, Delete account

Auth Actions (accessible from any page)
├─ Logout → Landing Page (/)
└─ Session timeout → Login modal → Return to previous page
```

---

### 4.4 Route Protection

**Public Routes** (no authentication required):
- `/` - Landing page
- `/login` - Login form
- `/register` - Registration form
- `/reset-password` - Password reset
- `/verify-email` - Email verification callback
- `/u/:username` - Public profiles (if visibility enabled)
- `/404` - Error page

**Protected Routes** (require authentication):
- `/timer` - Main timer interface
- `/history` - Solve history
- `/analytics` - Progress charts
- `/profile` - User settings

**Redirect Logic**:
- Accessing protected route while logged out → Redirect to `/login` with return URL
- Accessing `/login` or `/register` while logged in → Redirect to `/timer`
- Post-login redirect: Return to original destination or default to `/timer`

---

### 4.5 Deep Linking and State Preservation

**URL State Management**:
- History page filters encoded in query params: `/history?date=2025-01&penalty=dnf`
- Analytics date range: `/analytics?range=30d`
- Shareable public profiles: `/u/username` (clean, no query params)

**Session State Persistence**:
- Authentication state preserved via Supabase JWT tokens
- "Remember me" extends session to 30 days
- Active route preserved on refresh (React Router)
- Timer state NOT preserved (intentionally reset each session)

---

## 5. Key Components

### 5.1 Layout Components

#### `AppLayout`
**Purpose**: Main authenticated application shell with top app bar and content area

**Usage**: Wraps all protected routes

**Key Features**:
- Material UI `AppBar` with navigation links
- User menu (Avatar + Dropdown)
- Responsive drawer for mobile navigation
- Main content area with max-width constraint (1440px)
- Footer for non-authenticated pages

**Accessibility**:
- Skip to main content link (hidden unless focused)
- Semantic HTML (`<header>`, `<nav>`, `<main>`)
- ARIA landmarks properly labeled

---

#### `ProtectedRoute`
**Purpose**: Higher-order component that enforces authentication for protected routes

**Usage**: Wraps protected route groups in routing configuration

**Key Features**:
- Checks authentication state via `useAuth()` hook
- Redirects to `/login` if not authenticated
- Preserves original destination in location state (for post-login redirect)
- Shows loading spinner during auth check
- Renders `<Outlet />` (React Router v7) if authenticated

**Flow**:
```typescript
if (loading) return <LoadingSpinner fullScreen />;
if (!user) return <Navigate to="/login" state={{ from: location }} />;
return <Outlet />;
```

---

#### `Grid2` (Material UI)
**Purpose**: Responsive grid layout system for 3-panel timer page

**Usage**: Wraps left/center/right panels on timer page

**Key Features**:
- 12-column grid system
- Responsive breakpoints: `xs=12` (mobile), `md=3/6/3` (desktop)
- Auto-spacing with `spacing` prop
- No custom CSS required

**Example**:
```tsx
<Grid2 container spacing={2}>
  <Grid2 xs={12} md={3}><SessionStats /></Grid2>
  <Grid2 xs={12} md={6}><Timer /></Grid2>
  <Grid2 xs={12} md={3}><RecentSolves /></Grid2>
</Grid2>
```

---

### 5.2 Timer Components

#### `Timer`
**Purpose**: Large time display with state-based styling

**Props**: `timeMs: number`, `state: 'idle' | 'ready' | 'timing' | 'stopped'`

**Key Features**:
- Typography variant `h1` (4rem, 300 weight)
- Tabular numerals for alignment (`font-variant-numeric: tabular-nums`)
- Color-coded states: Idle (default), Ready (green), Timing (accent)
- Format: `MM:SS.mmm` for times > 60s, `SS.mmm` otherwise
- Smooth updates at 60fps during timing

**Accessibility**:
- `role="timer"` for screen readers
- `aria-live="polite"` for time updates
- Announced as "Timer: 12.45 seconds" when stopped

---

#### `Scramble`
**Purpose**: Display WCA-standard 3x3 scramble notation

**Props**: `scramble: string`, `onRegenerate?: () => void`

**Key Features**:
- Monospace font (Roboto Mono or Courier New)
- 18px font size for readability
- Word-wrap enabled for long scrambles
- Optional refresh button (future: manual regeneration)
- Selectable text (allows copying scramble)

**Example Output**: `R U R' U' R' F R2 U' R' U' R U R' F'`

**Accessibility**:
- `<code>` or `<pre>` tag for semantic meaning
- Copy button with keyboard shortcut (Ctrl+C when focused)

---

#### `PenaltyControls`
**Purpose**: Post-solve action buttons for applying penalties or deleting solve

**Props**: `solveId: string`, `onPenaltyApply: (type: PenaltyType) => void`, `onDelete: () => void`

**Key Features**:
- Three-button group: +2, DNF, Delete
- Material UI `Button` or `IconButton` components
- Toggle behavior for +2 and DNF (can remove penalty)
- Delete requires confirmation dialog
- Keyboard shortcuts: `2` for +2, `D` for DNF, `Delete` for delete
- Disabled during API calls (prevent double-apply)

**Visual States**:
- +2 applied: Button highlighted/active state
- DNF applied: Red highlight
- Delete: Red text, warning icon

---

### 5.3 Statistics Components

#### `StatsCard`
**Purpose**: Display single metric with label, value, and optional trend indicator

**Props**: `label: string`, `value: string | number`, `subtitle?: string`, `trend?: 'up' | 'down' | 'neutral'`, `icon?: ReactNode`

**Key Features**:
- Material UI `Card` with padding
- Large value display (Typography variant `h3`)
- Subtitle for context (e.g., "Achieved on Jan 15")
- Trend arrow icon (↑ improvement, ↓ regression, - neutral)
- Optional icon (trophy for PB, bar chart for averages)
- Responsive: Stacks vertically on mobile

**Example**:
```
┌─────────────────────┐
│ 🏆 Personal Best    │
│ 9.80s               │
│ Jan 15, 2025        │
└─────────────────────┘
```

---

#### `ProgressChart` (Recharts)
**Purpose**: Line chart visualizing solve times over time with trend line

**Props**: `solves: SolveDTO[]`, `dateRange: DateRange`, `showTrendLine: boolean`

**Key Features**:
- Recharts `LineChart` with `ResponsiveContainer`
- X-axis: Date/time (formatted as "Jan 15, 3:45 PM")
- Y-axis: Time in seconds (starts at 0)
- Two data series: Solve times (line), Moving average (dashed line)
- Tooltip on hover: Full solve details (time, scramble, date)
- Legend: Toggle series visibility
- Handles DNF solves (omit from chart or show as broken line)

**Accessibility**:
- `<title>` and `<desc>` tags for SVG chart
- Color contrast meets WCAG AA
- Keyboard navigation: Tab to legend items, Enter to toggle

---

#### `DistributionChart` (Recharts)
**Purpose**: Bar chart showing frequency distribution of solve times (histogram)

**Props**: `solves: SolveDTO[]`, `binSize?: number`

**Key Features**:
- Recharts `BarChart` with time ranges (bins) on X-axis
- Y-axis: Count of solves in each bin
- Bins: 0-10s, 10-12s, 12-14s, 14-16s, etc.
- Color-coded bars (gradient or single color)
- Tooltip: "12-14s: 15 solves"
- Highlights mode (most frequent bin)

**Use Case**: Identify consistency and target improvement zones

---

### 5.4 Data Display Components

#### `SolveListItem`
**Purpose**: Single solve entry for recent solves list or history table

**Props**: `solve: SolveDTO`, `onDelete?: () => void`, `onPenaltyUpdate?: (penalty: PenaltyType) => void`, `showScramble?: boolean`, `highlight?: boolean`

**Key Features**:
- Displays time with penalty indicator ("+2" suffix, "DNF" text)
- Relative timestamp ("2 minutes ago", "Today at 3:45 PM")
- Optional scramble display (collapsed by default, expandable)
- Action buttons: Edit penalty, Delete (if callbacks provided)
- Visual highlight for session best/worst (green/red border)
- Clickable to expand details (if in history view)

**Layout** (compact mode for recent solves):
```
12.45s (+2)  | 2 minutes ago
```

**Layout** (expanded mode for history):
```
┌───────────────────────────────────────┐
│ 12.45s (+2) | Jan 15, 2025 3:45 PM   │
│ R U R' U' R' F R2 U' R' U' R U R' F' │
│ [Edit] [Delete]                       │
└───────────────────────────────────────┘
```

---

#### `SolveTable` (History Page)
**Purpose**: Paginated table displaying all solves with sorting and filtering

**Props**: `solves: SolveDTO[]`, `totalCount: number`, `page: number`, `onPageChange: (page: number) => void`, `sortBy: SortOption`, `onSortChange: (sort: SortOption) => void`

**Key Features**:
- Material UI `Table` or `DataGrid`
- Columns: Time, Penalty, Scramble (truncated), Date, Actions
- Sortable headers (click to toggle ascending/descending)
- Pagination controls (Material UI `Pagination`)
- Row selection for bulk actions
- Expandable rows for full scramble
- Empty state: "No solves yet. Start solving!"

**Accessibility**:
- `<table>` with proper `<thead>`, `<tbody>`, `<th>` tags
- `aria-sort` on sortable columns
- Screen reader announcement for page changes

---

### 5.5 Form Components

#### `LoginForm`
**Purpose**: Email/password authentication form

**Props**: `onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>`, `defaultEmail?: string`

**Key Features**:
- Material UI `TextField` for email and password
- Password visibility toggle (eye icon)
- "Remember me" checkbox
- Submit button with loading spinner during API call
- Error display below form (not inline)
- Client-side validation (email format, required fields)
- Enter key submits form

**Validation Rules**:
- Email: Valid format, required
- Password: Minimum 1 character (backend validates security), required

---

#### `RegisterForm`
**Purpose**: New user registration form with password strength indicator

**Props**: `onSubmit: (email: string, password: string) => Promise<void>`

**Key Features**:
- Email, Password, Confirm Password fields
- Real-time password strength meter (weak/medium/strong)
- Password requirements list (8+ chars, updated as typed)
- Terms of service checkbox (required to submit)
- Inline validation errors (appears on blur)
- Matching password confirmation (validated on blur)

**Password Strength Calculation**:
- Weak: < 8 chars
- Medium: 8+ chars, lowercase + uppercase
- Strong: 8+ chars, lowercase + uppercase + numbers + symbols

---

#### `ProfileSettingsForm`
**Purpose**: Edit profile settings (username, visibility, password)

**Props**: `initialValues: ProfileFormData`, `onSave: (updates: ProfileUpdateCommand) => Promise<void>`

**Key Features**:
- Organized sections: Profile, Account, Privacy, Danger Zone
- Username field with uniqueness validation (debounced API check)
- Visibility toggle with info modal ("What will be shared?")
- Email display (read-only, cannot be changed)
- Password change section (expandable accordion)
- Save button (saves only changed fields)
- Success toast on save

**Validation**:
- Username: 3-30 chars, alphanumeric + `_` + `-`, unique
- Password: Same as registration requirements

---

### 5.6 Feedback Components

#### `LoadingSpinner`
**Purpose**: Indicate loading state during async operations

**Props**: `fullScreen?: boolean`, `size?: 'small' | 'medium' | 'large'`, `message?: string`

**Key Features**:
- Material UI `CircularProgress` component
- Full-screen overlay (optional, for page loads)
- Inline spinner (for button/section loads)
- Optional text message below spinner
- Aria-live region for screen readers

**Usage**:
```tsx
<LoadingSpinner fullScreen message="Loading your solves..." />
```

---

#### `ErrorAlert`
**Purpose**: Display error messages with retry option

**Props**: `message: string`, `onRetry?: () => void`, `severity?: 'error' | 'warning'`

**Key Features**:
- Material UI `Alert` component
- Red background (error) or yellow (warning)
- Error icon
- Optional retry button
- Dismissible (close button)
- Auto-focus message for screen readers (`role="alert"`)

**Example Messages**:
- "Failed to save solve. Check your connection and try again."
- "Session expired. Please log in again."

---

#### `SuccessSnackbar`
**Purpose**: Temporary success confirmation toast

**Props**: `message: string`, `open: boolean`, `onClose: () => void`, `duration?: number`

**Key Features**:
- Material UI `Snackbar` component
- Auto-dismiss after 3 seconds (default)
- Appears at bottom-center (desktop) or top (mobile)
- Green checkmark icon
- Manual close button

**Example Messages**:
- "Solve saved successfully!"
- "Profile updated!"
- "Link copied to clipboard!"

---

#### `ConfirmDialog`
**Purpose**: Reusable confirmation modal for destructive actions

**Props**: `open: boolean`, `title: string`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`, `confirmLabel?: string`, `severity?: 'error' | 'warning'`

**Key Features**:
- Material UI `Dialog` component
- Title, body text, and action buttons
- Red confirm button for dangerous actions (delete)
- Focus trap within modal
- Escape key to cancel
- Backdrop click to cancel (optional)

**Example**:
```tsx
<ConfirmDialog
  open={deleteDialogOpen}
  title="Delete Solve?"
  message="This action cannot be undone."
  confirmLabel="Delete"
  severity="error"
  onConfirm={handleDelete}
  onCancel={closeDialog}
/>
```

---

### 5.7 Utility Components

#### `EmptyState`
**Purpose**: Placeholder for empty data scenarios

**Props**: `title: string`, `message: string`, `action?: { label: string, onClick: () => void }`, `icon?: ReactNode`

**Key Features**:
- Centered layout with large icon (optional)
- Heading and explanatory text
- Optional call-to-action button
- Friendly, encouraging tone

**Examples**:
- History page with no solves: "No solves yet. Head to the timer to get started!"
- Analytics with < 12 solves: "Record at least 12 solves to see analytics."

---

#### `CopyButton`
**Purpose**: Copy text to clipboard with success feedback

**Props**: `text: string`, `label?: string`

**Key Features**:
- Material UI `IconButton` or `Button`
- Clipboard API (`navigator.clipboard.writeText()`)
- Success feedback: Icon changes to checkmark, tooltip shows "Copied!"
- Fallback for unsupported browsers (select text + Ctrl+C prompt)
- Keyboard accessible (Enter or Space)

**Usage**: Profile page (copy public URL), scramble display (copy scramble)

---

### 5.8 Authentication Components

#### `PasswordStrengthMeter`
**Purpose**: Visual indicator of password security during registration/change

**Props**: `password: string`

**Key Features**:
- Progress bar or segmented indicator (weak | medium | strong)
- Color-coded: Red (weak), yellow (medium), green (strong)
- Label below: "Weak password", "Strong password"
- Updates in real-time as user types
- Accessibility: `aria-valuenow`, `aria-valuetext` for screen readers

**Strength Calculation**:
- Based on length, character variety, common password check (future)
- Use library like `zxcvbn` (future) or simple rule-based check (MVP)

---

## 6. Additional Considerations

### 6.1 Responsive Design Breakpoints

**Material UI default breakpoints**:
- `xs`: 0px (mobile, portrait)
- `sm`: 600px (mobile, landscape)
- `md`: 900px (tablet)
- `lg`: 1200px (desktop)
- `xl`: 1536px (large desktop)

**Cubetive-specific responsive behaviors**:

**Timer Page**:
- **Desktop (md+)**: 3-panel layout side-by-side (25% | 50% | 25%)
- **Tablet (sm-md)**: 2-panel layout (Timer + Stats stacked, Recent Solves sidebar)
- **Mobile (xs)**: Single-column stack (Timer → Stats → Recent Solves)

**History Page**:
- **Desktop**: Table view with all columns
- **Tablet**: Table with truncated scramble column
- **Mobile**: Card-based list (stack rows as cards)

**Analytics Page**:
- **Desktop**: Charts side-by-side (2-column grid)
- **Mobile**: Charts stacked vertically (full-width)

---

### 6.2 Performance Optimization

**Code Splitting**:
- Lazy load chart library (Recharts) for Analytics page
- Lazy load heavy routes: `const AnalyticsPage = lazy(() => import('./features/analytics/pages/AnalyticsPage'))`

**Memoization**:
- Memoize expensive statistics calculations (`useMemo`)
- Memoize callback functions passed to child components (`useCallback`)
- React.memo for pure presentational components (Timer, SolveListItem)

**Pagination**:
- History page loads 50 solves per page (configurable)
- Infinite scroll NOT used (prefer pagination for accessibility)

**Timer Performance**:
- Use `requestAnimationFrame` for 60fps timer updates
- Avoid re-rendering entire page during timing (isolate timer component)

---

### 6.3 Keyboard Shortcuts

**Global Shortcuts** (work on any page):
- `Ctrl/Cmd + K`: Focus search (future)
- `?`: Show keyboard shortcuts help modal (future)

**Timer Page Shortcuts**:
- `Space`: Start/stop timer (primary interaction as per WCA standards)
- `2`: Apply +2 penalty to last solve
- `D`: Apply DNF penalty to last solve
- `Delete`: Delete last solve (with confirmation)
- `Esc`: Cancel ready state (if holding spacebar)

**History Page Shortcuts**:
- `N`: Next page
- `P`: Previous page
- Arrow keys: Navigate table rows
- Enter: Expand selected solve details

**Profile Page Shortcuts**:
- `Ctrl/Cmd + S`: Save changes

---

### 6.4 Accessibility Features (WCAG 2.1 Level A Compliance)

**Keyboard Navigation**:
- All interactive elements reachable via Tab key
- Logical tab order (left-to-right, top-to-bottom)
- Skip links: "Skip to main content", "Skip to timer"
- Focus indicators visible (default or custom with 3px outline)
- Modal focus trap (Esc to close)

**Screen Reader Support**:
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- ARIA landmarks: `role="navigation"`, `role="main"`, `role="complementary"`
- ARIA labels for icon buttons: `aria-label="Delete solve"`
- Live regions for dynamic updates: `aria-live="polite"` on timer, statistics
- Table headers properly associated: `<th scope="col">`

**Visual Accessibility**:
- Color contrast ratio ≥ 4.5:1 for normal text (WCAG AA)
- Color contrast ratio ≥ 3:1 for large text (≥ 18pt)
- No information conveyed by color alone (always include icons/text)
- Focus indicators distinct from default styles

**Form Accessibility**:
- All inputs have associated labels (`<label>` or `aria-label`)
- Error messages linked to fields (`aria-describedby`)
- Required fields marked (`aria-required="true"`)
- Validation errors announced to screen readers

---

### 6.5 Error States and Edge Cases

**No Solves Yet** (Empty States):
- Timer page: Show welcome message and instructions
- History page: "No solves recorded yet. Visit the Timer to get started!"
- Analytics page: "Record at least 12 solves to see analytics."

**Network Errors**:
- Save failed: Show retry button, preserve solve data in local state
- Load failed: Show error alert with refresh button
- Offline detection: Show banner "You're offline. Solves will sync when connection restores."

**Session Management**:
- Session timeout: Show login modal without leaving page
- Concurrent session logout: Redirect to login with message "You were logged out on another device."

**Validation Errors**:
- Username taken: Inline error below field, focus maintained
- Invalid scramble: Should never occur (generated server-side), but handle gracefully with new scramble

**Rate Limiting**:
- Too many requests: Show cooldown message "Please wait 30 seconds before trying again."

**Storage Limit**:
- Approaching 10,000 solves: Show warning banner at 9,500 solves
- At limit: Block new solves with message "Storage limit reached. Delete old solves to continue."

---

### 6.6 Security Considerations

**XSS Prevention**:
- React automatically escapes JSX (prevent XSS)
- User-generated content (scrambles) validated server-side
- No `dangerouslySetInnerHTML` used

**CSRF Protection**:
- Supabase JWT tokens immune to CSRF (no cookies for auth)
- All state-changing operations require valid JWT

**Authorization**:
- All data access protected by RLS policies (database-level)
- Frontend checks only for UX (don't show edit buttons for others' solves)
- Backend enforces all permissions

**Password Security**:
- Minimum 8 characters (FR-004)
- Password strength indicator encourages strong passwords
- Passwords never logged or displayed
- HTTPS enforced (Vercel automatic)

**Public Profile Privacy**:
- Users explicitly opt-in to public profiles (default: private)
- Clear explanation of what's shared (modal with preview)
- No sensitive information exposed (only what's configured as public)
- Profile URLs don't reveal user IDs (username-based)

**Session Security**:
- JWT tokens with expiration (1 hour by default)
- Refresh tokens for extended sessions (if "Remember me" enabled)
- Logout terminates all active sessions (future: selective logout)

---

### 6.7 Future Enhancements (Post-MVP)

**Timer Enhancements**:
- Visual scramble preview (3D cube with applied moves)
- Manual scramble entry for non-3x3 puzzles
- Voice-controlled timer ("Start", "Stop")
- Haptic feedback on mobile (when mobile solving optimized)

**Statistics Enhancements**:
- Ao50, Ao100 displayed on timer page
- Session comparison (compare today vs. last week)
- Solver insights: "Your F2L is slow" (AI-powered, future)
- Export statistics as CSV/JSON

**Social Features**:
- Leaderboards (global, friends-only)
- Achievement badges ("1000 solves", "Sub-10 single")
- Activity feed (follow other cubers)
- Competitions (virtual head-to-head)

**Profile Enhancements**:
- Avatar upload
- Custom profile themes
- Bio and location fields
- WCA ID integration (fetch official competition results)

**Analytics Enhancements**:
- Heat map (solve times by day/hour)
- Solve reconstruction (replay moves, future)
- Algorithm trainer (practice F2L, OLL, PLL cases)

**Accessibility Enhancements**:
- High contrast mode
- Dyslexia-friendly font option
- Customizable keyboard shortcuts
- Voice output for blind cubers

---

## 7. Success Criteria

This UI architecture successfully delivers the MVP if:

1. **Usability**: New users complete first solve within 5 minutes of registration
2. **Performance**: Timer responds to spacebar in < 100ms (FR-012)
3. **Accessibility**: All core features usable via keyboard only
4. **Responsiveness**: 3-panel layout adapts gracefully to mobile screens
5. **Data Integrity**: No solve data lost due to network errors (retry mechanism works)
6. **Security**: No unauthorized access to private profiles or solve data
7. **Clarity**: User journey from registration to first shared public profile is intuitive (no confusion)
8. **Visual Consistency**: All views use Material UI components consistently (no style drift)

**Key Metrics to Monitor Post-Launch**:
- Registration completion rate > 80% (US-001)
- Email verification rate > 90% (US-002)
- Average time to first solve < 5 minutes
- Timer usage: 20+ solves per active user per week (Success Metrics)
- Public profile adoption: 30% of active users (Success Metrics)

---

## Conclusion

This UI architecture provides a **comprehensive, implementable blueprint** for Cubetive's MVP. It balances:

- **Simplicity**: Focused on core speedcubing needs without over-engineering
- **Scalability**: Feature-first structure allows easy addition of new functionality
- **Usability**: 3-panel timer layout keeps critical information always visible
- **Accessibility**: WCAG 2.1 Level A compliance ensures inclusivity
- **Security**: RLS policies and authentication flows protect user data

The architecture aligns with all PRD requirements, leverages the existing API plan, and incorporates insights from the UI planning session. All user stories are mapped to specific views and components, ensuring complete feature coverage.

**Next Steps**:
1. Review this architecture with stakeholders
2. Prioritize Phase 1 components (Foundation + Auth as per Roadmap)
3. Begin implementation with timer page as primary focus
4. Iterate based on user feedback post-MVP launch
