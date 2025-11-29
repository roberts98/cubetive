# API Endpoint Implementation Plan: Get Current User Profile

## 1. Endpoint Overview

This endpoint retrieves the authenticated user's complete profile data from Supabase. It provides full access to the user's profile information including personal bests, statistics, and account settings. This is a protected endpoint requiring authentication via Supabase Auth.

**Purpose**: Allow authenticated users to fetch their own profile data for display in the dashboard, settings page, or profile view.

## 2. Request Details

- **HTTP Method**: `GET`
- **URL Structure**: `/rest/v1/profiles?id=eq.{user_id}&select=*`
- **Headers**:
  - `Authorization: Bearer {access_token}` (required)
  - `apikey: {supabase_anon_key}` (required by Supabase)
  - `Content-Type: application/json`

### Parameters

- **Required**: None (user_id derived from auth context)
- **Optional**: None

### Request Body

N/A - This is a GET request with no body.

## 3. Used Types

### Existing Types (from `src/types.ts`)

```typescript
/**
 * Full profile DTO returned for authenticated user's own profile
 * GET /rest/v1/profiles?id=eq.{user_id}
 */
export type ProfileDTO = Omit<ProfileRow, "deleted_at">;
```

The `ProfileDTO` type already exists and correctly represents the response payload. No new types are needed.

### Type Structure

```typescript
type ProfileDTO = {
  id: string;                      // UUID
  username: string;                // 3-30 chars, alphanumeric with _-
  profile_visibility: boolean;     // Public/private profile
  total_solves: number;            // Count of all solves
  pb_single: number | null;        // Best single time (ms)
  pb_single_date: string | null;   // When PB was achieved
  pb_single_scramble: string | null; // Scramble for PB solve
  pb_ao5: number | null;           // Best average of 5
  pb_ao5_date: string | null;      // When best Ao5 was achieved
  pb_ao12: number | null;          // Best average of 12
  pb_ao12_date: string | null;     // When best Ao12 was achieved
  created_at: string;              // Profile creation time
  updated_at: string;              // Last profile update
};
```

## 4. Response Details

### Success Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "id": "uuid",
  "username": "speedcuber123",
  "profile_visibility": true,
  "total_solves": 1523,
  "pb_single": 9800,
  "pb_single_date": "2025-01-15T10:30:00Z",
  "pb_single_scramble": "R U R' U' R' F R2 U' R' U' R U R' F'",
  "pb_ao5": 11200,
  "pb_ao5_date": "2025-01-14T15:45:00Z",
  "pb_ao12": 12500,
  "pb_ao12_date": "2025-01-13T09:20:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Error Responses

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| `401` | Unauthorized - Missing/invalid token | `{ "message": "Invalid token" }` |
| `404` | Profile not found | `{ "message": "Profile not found" }` |

## 5. Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│  React App  │────▶│  Supabase Client │────▶│  Supabase API  │
│             │     │  (supabase-js)   │     │  (PostgREST)   │
└─────────────┘     └──────────────────┘     └───────┬────────┘
                                                     │
                                                     ▼
                                            ┌────────────────┐
                                            │   PostgreSQL   │
                                            │  (profiles)    │
                                            │  + RLS Check   │
                                            └────────────────┘
```

### Flow Steps

1. **Client**: User navigates to profile/dashboard
2. **React App**: Calls Supabase client to fetch profile
3. **Supabase Client**: Constructs authenticated request with JWT
4. **Supabase API**: Validates JWT token via Supabase Auth
5. **PostgreSQL**:
   - RLS policy "Users can view own profile" validates `auth.uid() = id`
   - Returns profile row if exists and not soft-deleted
6. **Response**: Profile data returned through the chain to React

## 6. Security Considerations

### Authentication

- JWT token validation handled by Supabase Auth
- Token must be valid and not expired
- Token contains user's UUID used for profile lookup

### Authorization

- Row Level Security (RLS) policy enforces access control at database level
- Policy: `"Users can view own profile"` - ensures `auth.uid() = profiles.id`
- Users can only access their own profile through this endpoint

### Data Validation

- No input validation needed (GET request with no parameters)
- User ID derived from authenticated JWT, not from client input
- Prevents IDOR attacks by design

### Security Threats Mitigated

| Threat | Mitigation |
|--------|------------|
| Unauthorized access | JWT validation + RLS |
| IDOR (Insecure Direct Object Reference) | User ID from auth context only |
| SQL Injection | Supabase parameterized queries |
| Data leakage | RLS restricts to own profile |

## 7. Error Handling

### Error Scenarios

| Scenario | Status Code | Handling |
|----------|-------------|----------|
| Missing Authorization header | `401` | Return unauthorized error |
| Invalid/expired JWT | `401` | Return unauthorized error |
| User ID not in profiles table | `404` | Return not found error |
| Profile soft-deleted | `404` | RLS excludes, return not found |
| Database connection failure | `500` | Return server error, log for debugging |

### Client-Side Error Handling

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .is('deleted_at', null)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    // No rows returned - profile not found
    throw new Error('Profile not found');
  }
  if (error.message.includes('JWT')) {
    // Authentication error
    throw new Error('Unauthorized');
  }
  // Other errors
  console.error('Error fetching profile:', error);
  throw new Error('Failed to load profile');
}
```

## 8. Performance Considerations

### Current Optimizations

- **Indexed lookup**: `profiles.id` is primary key (indexed by default)
- **Single row fetch**: `.single()` returns exactly one row
- **RLS optimization**: Simple equality check on indexed column

### Expected Performance

- Query execution: < 10ms (indexed PK lookup)
- Total round-trip: < 100ms (including network latency)
- No N+1 queries (single table, single row)

### Future Optimizations (if needed)

- Client-side caching with React Query or SWR
- Supabase real-time subscription for profile updates
- Consider edge caching for public profile views

## 9. Implementation Steps

### Step 1: Create Profile Service Hook

Create `src/hooks/useProfile.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileDTO } from '../types';

export function useCurrentProfile() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Unauthorized');
        }

        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .is('deleted_at', null)
          .single();

        if (queryError) {
          throw queryError;
        }

        if (!data) {
          throw new Error('Profile not found');
        }

        setProfile(data as ProfileDTO);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}
```

### Step 2: Create Profile API Service (Optional)

For a more structured approach, create `src/services/profileService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import type { ProfileDTO } from '../types';

export async function getCurrentUserProfile(): Promise<ProfileDTO> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, profile_visibility, total_solves, pb_single, pb_single_date, pb_single_scramble, pb_ao5, pb_ao5_date, pb_ao12, pb_ao12_date, created_at, updated_at')
    .eq('id', user.id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Profile not found');
    }
    throw error;
  }

  return data as ProfileDTO;
}
```

### Step 3: Verify RLS Policies

Confirm the following RLS policy exists in `supabase/migrations/001_initial_schema.sql`:

```sql
-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

### Step 4: Create Unit Tests

Create `src/services/__tests__/profileService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUserProfile } from '../profileService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('getCurrentUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns profile for authenticated user', async () => {
    const mockProfile = {
      id: 'user-123',
      username: 'speedcuber123',
      profile_visibility: true,
      total_solves: 100,
      pb_single: 9800,
      // ... other fields
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    });

    const result = await getCurrentUserProfile();
    expect(result).toEqual(mockProfile);
  });

  it('throws Unauthorized when no user session', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(getCurrentUserProfile()).rejects.toThrow('Unauthorized');
  });

  it('throws Profile not found when profile missing', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' }
      }),
    });

    await expect(getCurrentUserProfile()).rejects.toThrow('Profile not found');
  });
});
```

### Step 5: Integration with UI Components

Example usage in a component:

```typescript
import { useCurrentProfile } from '../hooks/useProfile';

export function ProfileDashboard() {
  const { profile, loading, error } = useCurrentProfile();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!profile) return null;

  return (
    <div>
      <h1>{profile.username}</h1>
      <p>Total Solves: {profile.total_solves}</p>
      {profile.pb_single && (
        <p>PB Single: {(profile.pb_single / 1000).toFixed(2)}s</p>
      )}
      {/* ... more profile display */}
    </div>
  );
}
```

## 10. Implementation Checklist

- [ ] Create `src/services/profileService.ts` with `getCurrentUserProfile()`
- [ ] Create `src/hooks/useProfile.ts` with `useCurrentProfile()` hook
- [ ] Verify RLS policy exists for profile read access
- [ ] Write unit tests for service function
- [ ] Add error handling UI components
- [ ] Integrate with dashboard/profile page components
- [ ] Test end-to-end with Supabase local environment
- [ ] Verify 401/404 error scenarios work correctly
