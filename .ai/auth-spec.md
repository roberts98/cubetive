# Authentication System Architecture Specification - Cubetive

## Executive Summary

This document provides a comprehensive technical architecture for implementing user registration, login, password recovery, and email verification functionality for Cubetive using React (frontend), Supabase Auth (backend authentication), and Material UI (component library). The architecture addresses requirements US-001 through US-004 from the PRD while maintaining compatibility with existing application behavior.

## 1. USER INTERFACE ARCHITECTURE

### 1.1 Pages and Routes

The application will maintain a clear separation between authenticated and unauthenticated states with the following route structure:

#### Public Routes (Unauthenticated)
- `/` - Landing page (existing)
- `/login` - Login form page (existing shell, to be implemented)
- `/register` - Registration form page (existing shell, to be implemented)
- `/reset-password` - Password reset request page (new)
- `/update-password` - Password update form (accessed via email link) (new)
- `/verify-email` - Email verification handler (accessed via email link) (new)
- `/public/:username` - Public profile view (future, mentioned for completeness)

#### Protected Routes (Authenticated)
- `/dashboard` - Timer interface and main application view (new)
- `/profile` - User profile settings and management (new)
- `/history` - Solve history and statistics (future)

### 1.2 Page Components and Responsibilities

#### 1.2.1 Landing Page (`/`)
**Location:** `src/features/landing/pages/LandingPage.tsx` (existing)

**Changes Required:**
- Update Hero component to show different CTAs based on authentication state
- Authenticated users: "Go to Timer" button → `/dashboard`
- Unauthenticated users: "Get Started" button → `/register`, "Login" link → `/login`
- Add authentication state detection using Supabase auth listener

**Component Structure:**
```
LandingPage
├── Hero (modified)
│   ├── Authentication-aware CTAs
│   └── Navigation links
├── FeatureCard (existing)
└── Footer (existing)
```

#### 1.2.2 Login Page (`/login`)
**Location:** `src/features/auth/pages/LoginPage.tsx` (existing shell)

**Purpose:** Email/password authentication with session persistence

**Components:**
- `LoginPage` (container page component)
- `LoginForm` (new React component with form state management)
- Error display area
- Navigation links to `/register` and `/reset-password`

**Form Fields:**
1. Email address input (text, required, email validation)
2. Password input (password type, required, min 8 characters)
3. "Remember me" checkbox (optional, controls session persistence)
4. Submit button (disabled during loading)

**Component Structure:**
```
LoginPage (Astro/React page)
├── Container (MUI Container maxWidth="sm")
├── Paper (MUI Paper elevation={3})
├── LoginForm (React component)
│   ├── Email TextField
│   ├── Password TextField
│   ├── Remember Me Checkbox
│   ├── Submit Button
│   └── Error Alert (conditional)
├── Navigation Links
│   ├── "Forgot password?" → /reset-password
│   └── "Don't have an account? Sign up" → /register
└── Loading Indicator (conditional)
```

**Responsibilities:**
- **LoginForm Component:** Form validation, Supabase signInWithPassword call, local error handling
- **LoginPage:** Layout, navigation, redirect logic after successful login

#### 1.2.3 Registration Page (`/register`)
**Location:** `src/features/auth/pages/RegisterPage.tsx` (existing shell)

**Purpose:** New user account creation with email verification

**Components:**
- `RegisterPage` (container page component)
- `RegisterForm` (new React component)
- Password strength indicator
- Email verification prompt

**Form Fields:**
1. Email address input (text, required, email validation, duplicate check on submit)
2. Password input (password type, required, min 8 characters, strength indicator)
3. Confirm password input (password type, required, must match password)
4. Username input (text, required, 3-30 chars, alphanumeric with _ and -)
5. Submit button (disabled during loading)

**Component Structure:**
```
RegisterPage
├── Container (MUI Container)
├── Paper (MUI Paper)
├── RegisterForm (React component)
│   ├── Email TextField
│   ├── Username TextField (with availability check)
│   ├── Password TextField
│   │   └── PasswordStrengthIndicator (sub-component)
│   ├── Confirm Password TextField
│   ├── Submit Button
│   └── Error Alert (conditional)
├── Success Message (conditional, shown after registration)
│   └── "Check your email to verify your account"
└── Navigation Link
    └── "Already have an account? Login" → /login
```

**Responsibilities:**
- **RegisterForm Component:** Field validation, password strength calculation, Supabase signUp call, username uniqueness check
- **RegisterPage:** Layout, success state management, redirect logic

#### 1.2.4 Reset Password Page (`/reset-password`)
**Location:** `src/features/auth/pages/ResetPasswordPage.tsx` (new)

**Purpose:** Request password reset email

**Components:**
- `ResetPasswordPage` (container)
- `ResetPasswordRequestForm` (React component)

**Form Fields:**
1. Email address input (text, required, email validation)
2. Submit button

**Component Structure:**
```
ResetPasswordPage
├── Container
├── Paper
├── Heading: "Reset Your Password"
├── Instruction Text
├── ResetPasswordRequestForm
│   ├── Email TextField
│   ├── Submit Button
│   └── Success Message (conditional)
└── Navigation Link → /login
```

**Responsibilities:**
- **ResetPasswordRequestForm:** Email validation, Supabase resetPasswordForEmail call
- **ResetPasswordPage:** Success state display, security messaging

#### 1.2.5 Update Password Page (`/update-password`)
**Location:** `src/features/auth/pages/UpdatePasswordPage.tsx` (new)

**Purpose:** Set new password after clicking email reset link

**Components:**
- `UpdatePasswordPage` (container)
- `UpdatePasswordForm` (React component)
- Token validation logic

**Form Fields:**
1. New password input (password type, required, min 8 characters, strength indicator)
2. Confirm password input (password type, required, must match)
3. Submit button

**Component Structure:**
```
UpdatePasswordPage
├── Token validation check (on mount)
├── Container
├── Paper
├── UpdatePasswordForm
│   ├── New Password TextField
│   │   └── PasswordStrengthIndicator
│   ├── Confirm Password TextField
│   ├── Submit Button
│   └── Error Alert (conditional)
├── Success State
│   └── "Password updated successfully" → auto-redirect to /login
└── Invalid Token State
    └── Error message + link to /reset-password
```

**Responsibilities:**
- **UpdatePasswordForm:** Password validation, Supabase updateUser call
- **UpdatePasswordPage:** Token verification, session handling, redirect after success

#### 1.2.6 Email Verification Handler (`/verify-email`)
**Location:** `src/features/auth/pages/VerifyEmailPage.tsx` (new)

**Purpose:** Process email verification link clicks

**Component Structure:**
```
VerifyEmailPage
├── Auto-verification on mount (using hash token)
├── Loading State
│   └── "Verifying your email..."
├── Success State
│   ├── Success message
│   ├── "Go to Login" button → /login
│   └── Auto-redirect after 3 seconds
├── Error State
│   ├── Error message (expired/invalid token)
│   └── "Resend verification email" button
└── Container with centered content
```

**Responsibilities:**
- Extract verification token from URL
- Call Supabase verifyOtp
- Handle success/error states
- Provide manual resend option

#### 1.2.7 Dashboard Page (`/dashboard`)
**Location:** `src/features/timer/pages/DashboardPage.tsx` (new)

**Purpose:** Main authenticated user interface with timer

**Authentication Requirements:**
- Protected route - requires authenticated session
- Redirect to `/login` if not authenticated
- Show loading state during auth check

**Component Structure:**
```
DashboardPage (protected)
├── AuthGuard wrapper
├── Navigation Bar
│   ├── Logo → /dashboard
│   ├── Profile link → /profile
│   └── Logout button
├── TimerInterface (future component)
├── CurrentSessionStats (future)
└── QuickActions (future)
```

**Responsibilities:**
- Serve as landing page after successful login
- Enforce authentication requirement
- Provide navigation to other authenticated areas

#### 1.2.8 Profile Settings Page (`/profile`)
**Location:** `src/features/profile/pages/ProfilePage.tsx` (new)

**Purpose:** User profile management and settings

**Authentication Requirements:**
- Protected route - requires authenticated session

**Component Structure:**
```
ProfilePage (protected)
├── AuthGuard wrapper
├── Navigation Bar
├── Profile Settings Tabs
│   ├── General Tab
│   │   ├── Username editor
│   │   └── Profile visibility toggle
│   ├── Account Tab
│   │   ├── Email display (read-only, cannot be changed)
│   │   ├── Change password form
│   │   └── Account deletion
│   └── Statistics Tab (future)
└── Save/Cancel actions
```

**Responsibilities:**
- Profile data editing
- Password change (requires current password)
- Account management actions

### 1.3 Shared Components

#### 1.3.1 AuthGuard Component
**Location:** `src/features/auth/components/AuthGuard.tsx` (new)

**Purpose:** Higher-order component to protect routes requiring authentication

**Behavior:**
- Check Supabase session on mount
- Show loading spinner during auth check
- Redirect to `/login` with return URL if not authenticated
- Render children if authenticated

**Usage:**
```tsx
<AuthGuard>
  <DashboardPage />
</AuthGuard>
```

#### 1.3.2 PasswordStrengthIndicator Component
**Location:** `src/features/auth/components/PasswordStrengthIndicator.tsx` (new)

**Purpose:** Visual feedback for password strength

**Display:**
- Progress bar (MUI LinearProgress)
- Color-coded: red (weak) → yellow (medium) → green (strong)
- Text label: "Weak" | "Medium" | "Strong"

**Criteria:**
- Weak: < 8 characters
- Medium: 8+ characters with letters and numbers
- Strong: 12+ characters with letters, numbers, and special characters

#### 1.3.3 Navigation Bar Component
**Location:** `src/shared/components/NavigationBar.tsx` (new)

**Purpose:** Consistent navigation across authenticated pages

**Variants:**
- Authenticated: Logo, Profile, Logout
- Unauthenticated: Logo, Login, Sign Up

**Authentication Detection:**
- Subscribe to Supabase auth state changes
- Update navigation items dynamically

### 1.4 Form Validation and Error Handling

#### Client-Side Validation Rules

**Email Validation:**
- Required field
- Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Display error: "Please enter a valid email address"

**Password Validation (Registration/Update):**
- Required field
- Minimum 8 characters
- Display real-time strength indicator
- Error: "Password must be at least 8 characters"

**Password Confirmation:**
- Required field
- Must match password field
- Error: "Passwords do not match"

**Username Validation:**
- Required field
- 3-30 characters
- Alphanumeric with underscores and hyphens only
- Pattern: `^[a-zA-Z0-9_-]+$`
- Errors:
  - "Username must be 3-30 characters"
  - "Username can only contain letters, numbers, _ and -"
  - "Username is already taken" (from API)

#### Error Message Display Strategy

**Field-Level Errors:**
- Display below input field using MUI TextField error prop
- Show on blur or after submit attempt
- Clear on field change

**Form-Level Errors:**
- Display at top of form using MUI Alert component
- Severity: "error" for failures, "warning" for issues
- Auto-dismiss after 10 seconds or manual close

**API Error Mapping:**
```
Supabase Error Code → User-Friendly Message
"invalid_credentials" → "Invalid email or password"
"email_exists" → "An account with this email already exists"
"weak_password" → "Password does not meet security requirements"
"email_not_confirmed" → "Please verify your email address before logging in"
"invalid_token" → "This link has expired or is invalid"
```

### 1.5 User Flow Scenarios

#### Scenario 1: New User Registration
1. User navigates to `/` (landing page)
2. Clicks "Get Started" → `/register`
3. Fills registration form (email, username, password, confirm)
4. Client validates fields in real-time
5. Submits form
6. `RegisterForm` calls `supabase.auth.signUp({ email, password, options: { data: { username } } })`
7. Success: Shows "Check your email to verify your account" message
8. User receives verification email
9. Clicks verification link → `/verify-email?token=...`
10. `VerifyEmailPage` auto-verifies and redirects to `/login`
11. User logs in → redirected to `/dashboard`

#### Scenario 2: Returning User Login
1. User navigates to `/` or `/login`
2. Enters email and password
3. Optionally checks "Remember me"
4. Submits form
5. `LoginForm` calls `supabase.auth.signInWithPassword({ email, password })`
6. Success: Redirect to `/dashboard`
7. Session persists based on "Remember me" selection (30 days vs session-only)

#### Scenario 3: Password Reset
1. User on `/login` clicks "Forgot password?"
2. Navigates to `/reset-password`
3. Enters email address
4. Submits form
5. `ResetPasswordRequestForm` calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://cubetive.com/update-password' })`
6. Success message: "Check your email for password reset instructions"
7. User receives email with reset link
8. Clicks link → `/update-password` (with token in URL hash)
9. Enters new password and confirms
10. `UpdatePasswordForm` calls `supabase.auth.updateUser({ password: newPassword })`
11. Success: Auto-redirect to `/login`
12. User logs in with new password

#### Scenario 4: Unverified Email Login Attempt
1. User registers but doesn't verify email
2. Attempts to log in
3. Supabase returns `email_not_confirmed` error
4. Display error: "Please verify your email address. Check your inbox for the verification link."
5. Provide "Resend verification email" button
6. Button calls `supabase.auth.resend({ type: 'signup', email })`

#### Scenario 5: Authenticated User Accessing Auth Pages
1. Logged-in user navigates to `/login` or `/register`
2. Page component checks auth state on mount
3. Redirect to `/dashboard` if already authenticated
4. Prevents unnecessary form display

#### Scenario 6: Email Display (US-005)
1. User navigates to `/profile` → Account tab
2. Sees current email address displayed as read-only
3. Email cannot be modified by the user
4. To change email, user must contact support

**Important Notes:**
- Email address is permanent once set during registration
- Users cannot modify their email address through the UI
- This prevents account security issues and email enumeration attacks
- For email changes, users must contact support staff

### 1.6 Responsive Design Considerations

**Mobile View (< 600px):**
- Single column layout
- Full-width form fields
- Larger touch targets (min 44px)
- Stack navigation links vertically

**Tablet View (600px - 900px):**
- Centered form containers (maxWidth="sm")
- Comfortable padding and spacing

**Desktop View (> 900px):**
- Maximum form width: 600px
- Centered with ample whitespace
- Two-column layout for complex forms (future)

**Material UI Breakpoints:**
- Use MUI responsive utilities: `sx={{ display: { xs: 'block', md: 'flex' } }}`
- Leverage MUI Grid system for responsive layouts

## 2. BACKEND LOGIC

### 2.1 API Endpoints and Supabase Auth Methods

Cubetive uses Supabase Auth, which provides built-in endpoints and client methods. The frontend calls these methods via `@supabase/supabase-js` client.

#### 2.1.1 User Registration
**Method:** `supabase.auth.signUp()`

**Frontend Call:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: 'https://cubetive.com/verify-email',
    data: {
      username: username, // stored in auth.users.raw_user_meta_data
    }
  }
});
```

**Backend Process (Supabase):**
1. Validates email format and password strength
2. Checks for duplicate email
3. Hashes password using bcrypt
4. Creates record in `auth.users` with `email_confirmed_at = NULL`
5. Stores username in `raw_user_meta_data`
6. Triggers database function `handle_new_user()` which creates profile record
7. Sends verification email via Supabase email service
8. Returns user object (without session until verified)

**Response Handling:**
- Success: `data.user` exists, show verification message
- Error: Display mapped error message

**Database Side Effect:**
- Trigger `on_auth_user_created` inserts record in `profiles` table with username from `raw_user_meta_data`
- Username must be unique - checked via RPC call to database before allowing registration
- If username already exists, registration fails with "Username is already taken" error

#### 2.1.2 Email Verification
**Method:** `supabase.auth.verifyOtp()`

**Frontend Call:**
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: tokenHash, // extracted from URL
  type: 'email',
});
```

**Backend Process:**
1. Validates token hash against stored tokens
2. Checks token expiration (24 hours)
3. Updates `auth.users.email_confirmed_at` to current timestamp
4. Creates user session
5. Returns session object

**Token Extraction:**
```typescript
// From URL: /verify-email#access_token=...&refresh_token=...&type=...
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');
const refreshToken = hashParams.get('refresh_token');
const type = hashParams.get('type');
```

**Alternative: Automatic verification using session from hash:**
Supabase client can auto-detect tokens in URL hash:
```typescript
// On VerifyEmailPage mount, Supabase automatically parses tokens
// Check if session exists:
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // Email verified successfully
}
```

#### 2.1.3 User Login
**Method:** `supabase.auth.signInWithPassword()`

**Frontend Call:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});
```

**Backend Process:**
1. Looks up user by email
2. Verifies password hash
3. Checks `email_confirmed_at` is not null
4. Creates session tokens (JWT access token + refresh token)
5. Returns session and user objects

**Session Handling:**
- Access token: JWT with 1 hour expiration
- Refresh token: 30 days or session-only based on "remember me"
- Tokens stored in localStorage (persistent) or sessionStorage (session-only)

**Remember Me Implementation:**

Since Supabase client is initialized globally, we handle "remember me" differently:

```typescript
// In LoginForm, after successful login:
if (!rememberMe) {
  // Set session expiry flag in sessionStorage
  sessionStorage.setItem('session-temporary', 'true');

  // On app initialization, check this flag and set up session cleanup
  window.addEventListener('beforeunload', async () => {
    if (sessionStorage.getItem('session-temporary') === 'true') {
      await supabase.auth.signOut();
    }
  });
}
```

**Alternative Implementation (Recommended):**
Use Supabase's session configuration with shorter token lifetime for non-remember-me sessions:
- Remember Me ON: Default 30-day refresh token
- Remember Me OFF: Store flag and implement 1-hour idle timeout that calls `signOut()` automatically

#### 2.1.4 Password Reset Request
**Method:** `supabase.auth.resetPasswordForEmail()`

**Frontend Call:**
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://cubetive.com/update-password',
});
```

**Backend Process:**
1. Checks if email exists in `auth.users`
2. Generates password reset token (1 hour expiration)
3. Sends reset email with token link
4. Returns success (even if email doesn't exist, for security)

**Email Link Format:**
```
https://cubetive.com/update-password#access_token=...&refresh_token=...&type=recovery
```

**Security Note:**
- Always return success message regardless of email existence to prevent email enumeration

#### 2.1.5 Password Update
**Method:** `supabase.auth.updateUser()`

**Frontend Call:**
```typescript
const { data, error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

**Backend Process:**
1. Validates current session (must have recovery session from email link)
2. Validates new password strength
3. Hashes new password
4. Updates `auth.users` password hash
5. Invalidates all existing sessions for that user
6. Returns updated user object

**Session Invalidation:**
- All active sessions terminated
- User must log in again with new password
- Enhances security after password reset

#### 2.1.6 Logout
**Method:** `supabase.auth.signOut()`

**Frontend Call:**
```typescript
const { error } = await supabase.auth.signOut();
// Redirect to landing page
```

**Backend Process:**
1. Invalidates current session
2. Removes tokens from client storage
3. Returns success

#### 2.1.7 Session Check
**Method:** `supabase.auth.getSession()`

**Frontend Call:**
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
if (session) {
  // User is authenticated
  const userId = session.user.id;
  const userEmail = session.user.email;
}
```

**Usage:**
- In `AuthGuard` component on mount
- In navigation components to show/hide authenticated items
- Before making authenticated API calls

**Auth State Listener:**
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle login
  } else if (event === 'SIGNED_OUT') {
    // Handle logout, redirect to landing
  } else if (event === 'TOKEN_REFRESHED') {
    // Session refreshed automatically
  }
});
```

### 2.2 Data Models and Types

#### 2.2.1 TypeScript Interfaces

**Location:** `src/features/auth/types/auth.types.ts` (new)

```typescript
import { User, Session } from '@supabase/supabase-js';

// Re-export Supabase types for consistency
export type AuthUser = User;
export type AuthSession = Session;

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

// Auth context type
export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Password strength levels
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}
```

#### 2.2.2 Database Models

**auth.users (Supabase managed):**
- `id` (UUID): Primary key
- `email` (TEXT): User email
- `encrypted_password` (TEXT): Hashed password
- `email_confirmed_at` (TIMESTAMPTZ): Verification timestamp
- `raw_user_meta_data` (JSONB): Custom fields (username during registration)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**public.profiles (Application managed):**
- `id` (UUID): Foreign key to auth.users
- `username` (TEXT): Custom username
- `profile_visibility` (BOOLEAN): Public profile toggle
- Statistics fields (denormalized)
- Timestamps

**Relationship:**
- One-to-one: `auth.users.id` ← `profiles.id`
- Created automatically via trigger on user signup

### 2.3 Authentication Services Layer

#### 2.3.1 AuthService Module
**Location:** `src/features/auth/services/authService.ts` (new)

**Purpose:** Centralize all Supabase Auth operations with error handling

```typescript
import { supabase } from '@/db/supabase';
import type { AuthUser, AuthSession } from '../types/auth.types';

export class AuthService {
  // Registration
  static async register(email: string, password: string, username: string) {
    // Check username availability before attempting registration
    const isUsernameAvailable = await ProfileService.checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      throw new Error('Username is already taken');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { username }
      }
    });

    if (error) throw new Error(this.mapError(error.message));
    return data;
  }

  // Login
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(this.mapError(error.message));
    return data;
  }

  // Logout
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(this.mapError(error.message));
  }

  // Get current session
  static async getSession(): Promise<AuthSession | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Password reset request
  static async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    });

    if (error) throw new Error(this.mapError(error.message));
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw new Error(this.mapError(error.message));
  }

  // Resend verification email
  static async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    if (error) throw new Error(this.mapError(error.message));
  }

  // Error message mapping
  private static mapError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email address before logging in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 8 characters',
      'Password should be at least 8 characters': 'Password must be at least 8 characters',
      'Username already exists': 'Username is already taken',
      // Add more mappings as needed
    };

    return errorMap[errorMessage] || 'An error occurred. Please try again.';
  }
}
```

#### 2.3.2 ProfileService Updates
**Location:** `src/features/profile/services/profileService.ts` (existing, extend)

**New Methods:**

```typescript
export class ProfileService {
  // Check if username is available during registration
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .is('deleted_at', null)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned - username is available
      return true;
    }

    return false; // Username exists or other error
  }

  // Update username with uniqueness check
  static async updateUsername(userId: string, newUsername: string): Promise<void> {
    const isAvailable = await this.checkUsernameAvailability(newUsername);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', userId);

    if (error) throw error;
  }

  // Email cannot be updated by users - email is permanent
  // Users must contact support to change their email address
}

### 2.4 Input Validation

#### 2.4.1 Client-Side Validation Utilities
**Location:** `src/features/auth/utils/validation.ts` (new)

```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return username.length >= 3 &&
         username.length <= 30 &&
         usernameRegex.test(username);
};

export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;

  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/\d/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');

  const strength: PasswordStrength =
    score < 40 ? 'weak' :
    score < 70 ? 'medium' :
    'strong';

  return { strength, score, feedback };
};
```

#### 2.4.2 Form Validation Hooks
**Location:** `src/features/auth/hooks/useFormValidation.ts` (new)

```typescript
import { useState } from 'react';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string, additionalChecks?: any) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value) error = 'Email is required';
        else if (!validateEmail(value)) error = 'Invalid email format';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (!validatePassword(value)) error = 'Password must be at least 8 characters';
        break;
      case 'username':
        if (!value) error = 'Username is required';
        else if (!validateUsername(value)) error = 'Username must be 3-30 characters (letters, numbers, _ and - only)';
        break;
      case 'confirmPassword':
        if (value !== additionalChecks?.password) error = 'Passwords do not match';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const clearError = (name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const clearAllErrors = () => setErrors({});

  return { errors, validateField, clearError, clearAllErrors };
};
```

### 2.5 Exception Handling

#### Global Error Handling Strategy

**Error Categories:**
1. **Validation Errors**: Client-side, prevent submission
2. **Network Errors**: Connectivity issues, retry logic
3. **Authentication Errors**: Invalid credentials, expired tokens
4. **Server Errors**: Supabase service errors

**Error Handling Pattern:**
```typescript
// In form submission handlers
try {
  setLoading(true);
  setError(null);

  await AuthService.login(email, password);
  navigate('/dashboard');

} catch (err) {
  if (err instanceof Error) {
    setError(err.message); // User-friendly message from AuthService
  } else {
    setError('An unexpected error occurred');
  }
} finally {
  setLoading(false);
}
```

**Network Retry Logic:**
```typescript
// Wrapper for retryable operations
const withRetry = async (fn: () => Promise<any>, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

**Token Expiration Handling:**
- Supabase client auto-refreshes tokens before expiration
- On 401 responses, trigger re-authentication
- Show session expired message and redirect to login

## 3. AUTHENTICATION SYSTEM

### 3.1 Supabase Auth Integration

#### 3.1.1 Supabase Client Configuration

**Location:** `src/db/supabase.ts` (existing, no changes needed)

Current configuration:
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Enhanced Configuration (optional for better control):**
```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage, // or sessionStorage for session-only
  },
});
```

#### 3.1.2 Email Configuration

**Supabase Dashboard Settings:**
1. Navigate to Authentication > Email Templates
2. Customize email templates:
   - **Confirm signup**: Email verification
   - **Reset password**: Password reset link
   - **Magic link**: (not used in MVP)

**Email Template Redirect URLs:**
- Verification: `{{ .SiteURL }}/verify-email`
- Password reset: `{{ .SiteURL }}/update-password`

**Email Provider:**
- MVP: Supabase built-in email service (limited to 3 emails/hour in free tier)
- Production: Configure custom SMTP (SendGrid, AWS SES, etc.) in Supabase dashboard

**Email Customization:**
```html
<!-- Confirmation Email Template -->
<h2>Welcome to Cubetive!</h2>
<p>Thanks for signing up. Please verify your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>This link expires in 24 hours.</p>
```

```html
<!-- Password Reset Email Template -->
<h2>Reset Your Password</h2>
<p>You requested to reset your password. Click the link below to continue:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, please ignore this email.</p>
```

### 3.2 Session Management

#### 3.2.1 Session Lifecycle

**Session Creation (Login):**
1. User submits login form
2. Supabase validates credentials
3. Returns access token (JWT, 1 hour) + refresh token (30 days)
4. Tokens stored in localStorage/sessionStorage
5. Access token included in subsequent API requests

**Session Persistence:**
- **Remember Me = ON**: localStorage (persists across browser restarts)
- **Remember Me = OFF**: sessionStorage (cleared on tab close)

**Session Refresh:**
- Automatic refresh triggered by Supabase client 5 minutes before expiration
- Refresh token used to obtain new access token
- Transparent to user, no interruption

**Session Termination:**
- Explicit logout: Tokens invalidated server-side and removed client-side
- Inactivity timeout: Not implemented in MVP (future enhancement)
- Security event: Password change invalidates all sessions

#### 3.2.2 Auth State Management

**React Context Provider:**
**Location:** `src/features/auth/context/AuthContext.tsx` (new)

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthUser, AuthSession } from '../types/auth.types';
import { supabase } from '@/db/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email: string, password: string, username: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    resetPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    updatePassword: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Usage in App.tsx:**
```typescript
import { AuthProvider } from './features/auth/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {/* Routes */}
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 3.3 Route Protection

#### Protected Route Component
**Location:** `src/features/auth/components/ProtectedRoute.tsx` (new)

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect to login, save attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

**Usage in Routes:**
```typescript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    }
  />
</Routes>
```

### 3.4 Account Recovery

#### Email Verification Resend Flow
1. User attempts login with unverified email
2. System detects `email_not_confirmed` error
3. Display message: "Your email is not verified. Check your inbox for the verification link."
4. Provide "Resend Verification Email" button
5. Button triggers `supabase.auth.resend({ type: 'signup', email })`
6. Success message: "Verification email sent. Please check your inbox."
7. User clicks new verification link and completes flow

#### Password Reset Flow Security
- Reset links expire after 1 hour
- Token single-use: Invalidated after successful password update
- All sessions terminated after password change
- Rate limiting: Max 3 reset requests per email per hour (Supabase built-in)

#### Account Deletion Flow
**Implementation for US-005:**

```typescript
// In ProfileService
static async deleteAccount(userId: string): Promise<void> {
  // Step 1: Soft delete profile and related data
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) throw profileError;

  // Step 2: Delete auth.users record (actual account deletion)
  // This requires Supabase Admin API or Service Role Key
  // For MVP: Only soft delete profile, keep auth record
  // User must contact support for full deletion

  // Step 3: Sign out user
  await supabase.auth.signOut();
}
```

**User Experience:**
1. User clicks "Delete Account" in Profile settings
2. Confirmation dialog: "Are you sure? This action cannot be undone."
3. Require password re-entry for security
4. Show message: "Your account has been deactivated. Contact support@cubetive.com to permanently delete your data."
5. Soft delete profile (sets `deleted_at`)
6. Sign out user immediately
7. RLS policies automatically hide all user's data from queries

**Future Enhancement:**
- Implement scheduled job to hard delete records after 30-day grace period
- Add admin API endpoint to permanently delete auth.users record
- GDPR compliance: Provide data export before deletion

## 4. IMPLEMENTATION MODULES AND CONTRACTS

### 4.1 Directory Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx (redirect if not authenticated)
│   │   │   ├── ProtectedRoute.tsx (route wrapper)
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ResetPasswordRequestForm.tsx
│   │   │   └── UpdatePasswordForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx (existing shell)
│   │   │   ├── RegisterPage.tsx (existing shell)
│   │   │   ├── ResetPasswordPage.tsx (new)
│   │   │   ├── UpdatePasswordPage.tsx (new)
│   │   │   └── VerifyEmailPage.tsx (new)
│   │   ├── services/
│   │   │   └── authService.ts (Supabase wrapper)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts (auth context hook)
│   │   │   └── useFormValidation.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   └── validation.ts
│   │   └── types/
│   │       └── auth.types.ts
│   ├── timer/
│   │   └── pages/
│   │       └── DashboardPage.tsx (new, main authenticated page)
│   └── profile/
│       ├── pages/
│       │   └── ProfilePage.tsx (new)
│       └── services/
│           └── profileService.ts (existing, extend)
├── shared/
│   └── components/
│       └── NavigationBar.tsx (new)
└── App.tsx (update with AuthProvider and routes)
```

### 4.2 Component Contracts

#### AuthProvider Props
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

#### AuthContext Value
```typescript
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}
```

#### LoginForm Props
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

#### RegisterForm Props
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

#### PasswordStrengthIndicator Props
```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
  onStrengthChange?: (result: PasswordStrengthResult) => void;
}
```

#### ProtectedRoute Props
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // default: '/login'
}
```

### 4.3 Service Contracts

#### AuthService Methods
```typescript
class AuthService {
  static register(email: string, password: string, username: string): Promise<AuthResponse>;
  static login(email: string, password: string): Promise<AuthResponse>;
  static logout(): Promise<void>;
  static getSession(): Promise<AuthSession | null>;
  static getCurrentUser(): Promise<AuthUser | null>;
  static requestPasswordReset(email: string): Promise<void>;
  static updatePassword(newPassword: string): Promise<void>;
  static resendVerificationEmail(email: string): Promise<void>;
}
```

#### ProfileService Methods (Extensions)
```typescript
class ProfileService {
  // Existing methods
  static async getProfile(userId: string): Promise<Profile>;

  // New methods for auth integration
  static async updateUsername(userId: string, newUsername: string): Promise<void>;
  static async checkUsernameAvailability(username: string): Promise<boolean>;
  static async deleteAccount(userId: string): Promise<void>;
}
```

### 4.4 Hook Contracts

#### useAuth Hook
```typescript
const useAuth = (): AuthContextType;
```

#### useFormValidation Hook
```typescript
const useFormValidation = (): {
  errors: Record<string, string>;
  validateField: (name: string, value: string, additionalChecks?: any) => boolean;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
};
```

### 4.5 Validation Utilities

```typescript
// Email validation
validateEmail(email: string): boolean;

// Password validation
validatePassword(password: string): boolean;

// Username validation
validateUsername(username: string): boolean;

// Password strength calculation
calculatePasswordStrength(password: string): PasswordStrengthResult;
```

### 4.6 Type Definitions

See section 2.2.1 for complete TypeScript type definitions.

## 5. SECURITY CONSIDERATIONS

### 5.1 Password Security
- Minimum 8 characters enforced
- Hashed using bcrypt (Supabase default)
- Strength indicator guides users to stronger passwords
- No password complexity requirements in MVP (future: enforce special chars, numbers)

### 5.2 Session Security
- JWT tokens with short expiration (1 hour)
- Refresh tokens rotated on use
- Sessions invalidated on password change
- HTTPS enforced in production (Vercel automatic)

### 5.3 Rate Limiting
- Supabase built-in rate limiting on auth endpoints
- 3 password reset requests per email per hour
- Login attempt throttling after 5 failures

### 5.4 Data Protection
- Row Level Security (RLS) enforces data access
- Users can only read/write their own data
- Public profiles expose limited information only
- Soft deletes preserve data integrity

## 6. TESTING STRATEGY

### 6.1 Unit Tests
- Form validation functions
- Password strength calculation
- Error message mapping
- Utility functions

### 6.2 Integration Tests
- Login flow
- Registration with email verification
- Password reset flow
- Session persistence
- Protected route access

### 6.3 E2E Tests (Future)
- Complete user registration journey
- Login → Timer → Logout flow
- Password reset from email link
- Profile settings update

## 7. MIGRATION AND DEPLOYMENT

### 7.1 Environment Variables
```env
# .env.local (development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Production (Vercel environment variables)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 7.2 Supabase Configuration

**CRITICAL**: These settings must be configured before deployment:

1. **Enable Email Authentication**
   - Go to Authentication > Providers
   - Enable "Email" provider

2. **Configure Password Policy**
   - Go to Authentication > Policies
   - Set minimum password length: 8 characters
   - ⚠️ Default is 6 characters - MUST change to meet PRD requirement (FR-004)

3. **Configure Email Templates**
   - Go to Authentication > Email Templates
   - Update redirect URLs:
     - Confirm signup: `{{ .SiteURL }}/verify-email`
     - Reset password: `{{ .SiteURL }}/update-password`
   - Customize email content (see Section 3.1.2)

4. **Set Up SMTP for Production**
   - Go to Authentication > Email Settings
   - Configure custom SMTP (SendGrid, AWS SES, Postmark, etc.)
   - Free tier limited to 3 emails/hour - insufficient for production

5. **Enable Rate Limiting**
   - Go to Authentication > Rate Limits
   - Verify default limits:
     - Password reset: 3 requests/hour per email
     - Login attempts: throttled after 5 failures
     - Signup: 10 requests/hour per IP

### 7.3 Vercel Deployment
1. Connect GitHub repository
2. Add environment variables in project settings
3. Configure build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy and verify email redirects work with production domain

## 8. FUTURE ENHANCEMENTS

### 8.1 OAuth Providers
- Google Sign-In
- GitHub authentication
- Discord authentication (for gaming community)

### 8.2 Two-Factor Authentication (2FA)
- TOTP-based 2FA using authenticator apps
- Backup codes for account recovery

### 8.3 Session Management
- View active sessions
- Revoke specific sessions
- Inactivity timeout

### 8.4 Advanced Password Policies
- Password history (prevent reuse of last 5 passwords)
- Mandatory password rotation (every 90 days)
- Leaked password detection (HaveIBeenPwned integration)

## 9. ACCEPTANCE CRITERIA MAPPING

### US-001: User Registration
✅ Registration form accessible from landing page
✅ Email validation performed client-side
✅ Password minimum 8 characters enforced
✅ Duplicate email rejected with user-friendly message
✅ Verification email sent on successful registration
✅ Confirmation message displayed

### US-002: Email Verification
✅ Verification email sent within Supabase processing time
✅ Unique verification link with 24-hour expiration
✅ Valid link activates account and redirects to login
✅ Expired links show appropriate error
✅ Resend verification email option available

### US-003: User Login
✅ Login form accepts email and password
✅ Invalid credentials show generic error message
✅ Successful login redirects to timer dashboard
✅ Unverified accounts show verification reminder
✅ "Remember me" option for 30-day session

### US-004: Password Reset
✅ Reset request form accepts email address
✅ Reset email sent for valid accounts
✅ Reset link expires after 1 hour
✅ New password must meet security requirements
✅ Successful reset confirms change and redirects to login
✅ All active sessions terminated after password change

## 10. CONCLUSION

This architecture provides a complete authentication system for Cubetive using Supabase Auth, React, and Material UI. It addresses all requirements from US-001 through US-004, maintains compatibility with the existing application structure, and provides a foundation for future enhancements.

The implementation follows best practices for security, user experience, and code organization, leveraging Supabase's built-in authentication features to minimize custom backend logic while maintaining flexibility for future customization.

Key strengths of this architecture:
- **Separation of concerns**: Clear boundaries between UI, services, and backend
- **Reusability**: Shared components and hooks reduce code duplication
- **Security**: RLS policies, JWT tokens, and secure password handling
- **User experience**: Clear error messages, loading states, and intuitive flows
- **Scalability**: Modular structure supports future feature additions

Next steps for implementation:
1. Create directory structure and type definitions
2. Implement AuthService and validation utilities
3. Build form components with validation hooks
4. Create pages and integrate forms
5. Add AuthProvider to application root
6. Test authentication flows end-to-end
7. Configure Supabase email templates
8. Deploy to staging and verify email workflows
