# Cubetive Database Schema Documentation (Simplified)

## Overview

This document describes the simplified PostgreSQL database schema for Cubetive. The schema leverages Supabase's built-in authentication (`auth.users`) and adds minimal custom tables for application-specific data.

## Design Philosophy

**Leverage Supabase, keep it simple:**
- Use Supabase's `auth.users` for authentication
- Only create a `profiles` table for additional user data
- Keep all business logic in the application
- Use RLS for security

## Database Structure

### Authentication (Handled by Supabase)

The `auth.users` table is managed by Supabase and includes:
- User ID (UUID)
- Email
- Password (hashed)
- Email verification status
- Authentication metadata

### Custom Tables

#### 1. `profiles` Table

Extends `auth.users` with application-specific data.

**Columns:**
- `id` (UUID, PK): References auth.users(id)
- `username` (TEXT, UNIQUE): Custom username for profile URLs
- `profile_visibility` (BOOLEAN): Whether profile is public
- `total_solves` (INTEGER): Count of all solves
- `pb_single` (INTEGER): Best single time in milliseconds
- `pb_single_date` (TIMESTAMPTZ): When PB was achieved
- `pb_single_scramble` (TEXT): Scramble for PB solve
- `pb_ao5` (INTEGER): Best average of 5
- `pb_ao5_date` (TIMESTAMPTZ): When best Ao5 was achieved
- `pb_ao12` (INTEGER): Best average of 12
- `pb_ao12_date` (TIMESTAMPTZ): When best Ao12 was achieved
- `created_at` (TIMESTAMPTZ): Profile creation time
- `updated_at` (TIMESTAMPTZ): Last profile update
- `deleted_at` (TIMESTAMPTZ): Soft delete timestamp

**Constraints:**
- Username: 3-30 characters, alphanumeric with underscores and hyphens
- Username must match pattern: `^[a-zA-Z0-9_-]+$`

#### 2. `solves` Table

Stores individual solve records.

**Columns:**
- `id` (UUID, PK): Unique solve identifier
- `user_id` (UUID, FK): References auth.users(id) directly
- `time_ms` (INTEGER): Raw solve time in milliseconds
- `scramble` (TEXT): WCA notation scramble
- `penalty_type` (TEXT): NULL, '+2', or 'DNF'
- `created_at` (TIMESTAMPTZ): When solve was recorded
- `deleted_at` (TIMESTAMPTZ): Soft delete timestamp

**Constraints:**
- Time must be positive
- Scramble cannot be empty
- Penalty type must be '+2', 'DNF', or NULL

## Indexes

- `idx_profiles_username`: Fast username lookups
- `idx_profiles_visibility`: Public profile queries
- `idx_solves_user_id`: User's solves lookup
- `idx_solves_user_created`: Recent solves queries (composite)

## Functions & Triggers

### Minimal Functions

1. **`handle_new_user()`**
   - Creates profile when user signs up
   - Generates initial username from email

2. **`handle_updated_at()`**
   - Updates the `updated_at` timestamp

### Triggers

1. **`on_auth_user_created`**
   - Creates profile automatically after signup

2. **`trigger_update_profiles_updated_at`**
   - Updates timestamp on profile changes

## Row Level Security (RLS)

### Profiles Table Policies

1. **"Users can view own profile"** - Always see your own data
2. **"Anyone can view public profiles"** - Public profiles are viewable
3. **"Users can update own profile"** - Only update your own profile
4. **"Service role can insert profiles"** - For the signup trigger

### Solves Table Policies

1. **"Users can view own solves"** - Only see your own solves
2. **"Users can insert own solves"** - Only add your own solves
3. **"Users can update own solves"** - Update penalties/soft delete
4. **"Users can delete own solves"** - Delete your own solves

## Application Responsibilities

The application handles ALL business logic:

- **Average calculations** (Ao5, Ao12, Ao100)
- **Penalty application** (+2 seconds, DNF handling)
- **Session detection** (based on time gaps)
- **Statistics updates** (updating PB and best averages)
- **Solve limit enforcement** (10,000 per user)
- **Soft delete cleanup** (removing old deleted records)

## Usage Examples

### Getting user profile with email from auth
```javascript
// In your application using Supabase client
const { data } = await supabase
  .from('profiles')
  .select(`
    *,
    auth.users!inner(email)
  `)
  .eq('username', 'speedcuber123')
  .single();
```

### Getting recent solves
```sql
SELECT * FROM solves
WHERE user_id = 'user-uuid'
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Getting public profile
```sql
SELECT username, pb_single, pb_ao5, pb_ao12, total_solves
FROM profiles
WHERE username = 'speedcuber123'
  AND profile_visibility = true
  AND deleted_at IS NULL;
```

### Inserting a new solve
```sql
INSERT INTO solves (user_id, time_ms, scramble, penalty_type)
VALUES ('user-uuid', 12500, 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', NULL);
```

### Updating profile statistics
```sql
UPDATE profiles
SET
    pb_single = 9800,
    pb_single_date = NOW(),
    pb_single_scramble = 'scramble-notation',
    total_solves = total_solves + 1,
    updated_at = NOW()
WHERE id = 'user-uuid';
```

## Setup Instructions

1. **Run the migration:**
   ```bash
   supabase migration up
   ```

2. **Configure Supabase Auth:**
   - Enable email authentication
   - Set up email verification
   - Configure password policies

3. **Environment Variables:**
   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

## Key Differences from Traditional Approach

1. **No custom users table** - We use Supabase's auth.users
2. **Profiles table** - Only for app-specific data
3. **Direct references** - Solves reference auth.users, not profiles
4. **Minimal functions** - Only what's absolutely necessary
5. **Application logic** - All calculations and business rules in the app

## Security Notes

- RLS is always enabled
- Users can only access their own data
- Public profiles expose limited information
- Authentication is handled entirely by Supabase

## Performance Considerations

- Denormalized statistics in profiles table
- Indexed queries for common operations
- No complex calculations in database
- Soft deletes handled by application

This approach keeps the database layer thin and simple while leveraging Supabase's built-in features for authentication and security.