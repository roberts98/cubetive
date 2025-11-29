# REST API Plan

## Overview

This document defines the REST API plan for Cubetive, a web-based Rubik's Cube speedcubing timer and analytics platform. The API leverages Supabase's auto-generated REST API with Row Level Security (RLS) policies for authorization.

**Architecture**: Frontend (React) → Supabase PostgREST API → PostgreSQL Database

## 1. Resources

| Resource | Database Table | Description |
|----------|---------------|-------------|
| Auth | `auth.users` (Supabase managed) | User authentication and session management |
| Profiles | `profiles` | User profiles with statistics and preferences |
| Solves | `solves` | Individual solve records with times and penalties |

## 2. Endpoints

### 2.1 Authentication (Supabase Auth API)

Authentication is handled by Supabase Auth, not custom endpoints. The following are the Supabase Auth methods used via `@supabase/supabase-js`:

#### Sign Up
- **Method**: `supabase.auth.signUp()`
- **Description**: Register a new user account
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Payload**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "email_confirmed_at": null
    },
    "session": null
  }
  ```
- **Success**: User created, verification email sent
- **Errors**:
  - `422`: Invalid email format
  - `422`: Password too weak (minimum 8 characters)
  - `422`: Email already registered

#### Sign In
- **Method**: `supabase.auth.signInWithPassword()`
- **Description**: Authenticate existing user
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Payload**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
  ```
- **Success**: Session created
- **Errors**:
  - `400`: Invalid credentials
  - `400`: Email not verified

#### Sign Out
- **Method**: `supabase.auth.signOut()`
- **Description**: End user session
- **Response**: `{ "error": null }`
- **Success**: Session terminated

#### Password Reset Request
- **Method**: `supabase.auth.resetPasswordForEmail()`
- **Description**: Send password reset email
- **Request Payload**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: `{ "data": {}, "error": null }`
- **Success**: Reset email sent (always returns success for security)

#### Update Password
- **Method**: `supabase.auth.updateUser()`
- **Description**: Update user password (authenticated)
- **Request Payload**:
  ```json
  {
    "password": "newSecurePassword123"
  }
  ```
- **Success**: Password updated, all sessions terminated

---

### 2.2 Profiles

Base URL: `/rest/v1/profiles`

#### Get Current User Profile
- **Method**: `GET`
- **URL**: `/rest/v1/profiles?id=eq.{user_id}&select=*`
- **Description**: Retrieve authenticated user's profile
- **Headers**: `Authorization: Bearer {access_token}`
- **Query Parameters**: None (user_id from auth context)
- **Response Payload**:
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
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized (missing/invalid token)
  - `404`: Profile not found

#### Get Public Profile by Username
- **Method**: `GET`
- **URL**: `/rest/v1/profiles?username=eq.{username}&profile_visibility=eq.true&deleted_at=is.null&select=username,pb_single,pb_ao5,pb_ao12,total_solves,created_at`
- **Description**: Retrieve a public profile (no authentication required)
- **Headers**: `apikey: {anon_key}`
- **Query Parameters**:
  - `username` (required): Username to look up
- **Response Payload**:
  ```json
  {
    "username": "speedcuber123",
    "pb_single": 9800,
    "pb_ao5": 11200,
    "pb_ao12": 12500,
    "total_solves": 1523,
    "created_at": "2025-01-01T00:00:00Z"
  }
  ```
- **Success**: `200 OK`
- **Errors**:
  - `200`: Empty array if profile not found or private

#### Update Profile
- **Method**: `PATCH`
- **URL**: `/rest/v1/profiles?id=eq.{user_id}`
- **Description**: Update user profile settings
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "username": "newusername",
    "profile_visibility": true
  }
  ```
- **Response Payload**: Updated profile object
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized
  - `409`: Username already taken
  - `422`: Invalid username format (must match `^[a-zA-Z0-9_-]+$`, 3-30 characters)

#### Update Profile Statistics
- **Method**: `PATCH`
- **URL**: `/rest/v1/profiles?id=eq.{user_id}`
- **Description**: Update denormalized statistics after new PB
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "pb_single": 9500,
    "pb_single_date": "2025-01-16T14:00:00Z",
    "pb_single_scramble": "R' U2 R U2 R' F R U R' U' R' F' R2",
    "total_solves": 1524
  }
  ```
- **Response Payload**: Updated profile object
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized
  - `403`: Can only update own profile

#### Delete Profile (Soft Delete)
- **Method**: `PATCH`
- **URL**: `/rest/v1/profiles?id=eq.{user_id}`
- **Description**: Soft delete user profile
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "deleted_at": "2025-01-16T14:00:00Z"
  }
  ```
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized

---

### 2.3 Solves

Base URL: `/rest/v1/solves`

#### List User Solves
- **Method**: `GET`
- **URL**: `/rest/v1/solves?user_id=eq.{user_id}&deleted_at=is.null&order=created_at.desc`
- **Description**: Retrieve user's solve history with pagination
- **Headers**: `Authorization: Bearer {access_token}`
- **Query Parameters**:
  - `limit` (optional): Number of records (default: 50, max: 100)
  - `offset` (optional): Pagination offset
  - `order` (optional): Sort order (default: `created_at.desc`)
- **Response Payload**:
  ```json
  [
    {
      "id": "uuid",
      "user_id": "uuid",
      "time_ms": 12500,
      "scramble": "R U R' U' R' F R2 U' R' U' R U R' F'",
      "penalty_type": null,
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "time_ms": 14200,
      "scramble": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      "penalty_type": "+2",
      "created_at": "2025-01-15T10:29:00Z"
    }
  ]
  ```
- **Response Headers**:
  - `Content-Range`: Total count for pagination
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized

#### Get Recent Solves for Public Profile
- **Method**: `GET`
- **URL**: `/rest/v1/solves?user_id=eq.{profile_user_id}&deleted_at=is.null&order=created_at.desc&limit=10&select=time_ms,penalty_type,created_at`
- **Description**: Get last 10 solves for a public profile (requires profile visibility check first)
- **Headers**: `apikey: {anon_key}`
- **Response Payload**:
  ```json
  [
    {
      "time_ms": 12500,
      "penalty_type": null,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
  ```
- **Note**: RLS policy should only allow this if profile is public
- **Success**: `200 OK`

#### Create Solve
- **Method**: `POST`
- **URL**: `/rest/v1/solves`
- **Description**: Record a new solve
- **Headers**:
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
  - `Prefer: return=representation`
- **Request Payload**:
  ```json
  {
    "user_id": "uuid",
    "time_ms": 12500,
    "scramble": "R U R' U' R' F R2 U' R' U' R U R' F'",
    "penalty_type": null
  }
  ```
- **Response Payload**: Created solve object
- **Success**: `201 Created`
- **Errors**:
  - `401`: Unauthorized
  - `422`: Invalid time (must be positive)
  - `422`: Empty scramble
  - `422`: Invalid penalty type (must be `null`, `"+2"`, or `"DNF"`)
  - `403`: Solve limit reached (10,000) - enforced by application

#### Update Solve (Penalty)
- **Method**: `PATCH`
- **URL**: `/rest/v1/solves?id=eq.{solve_id}`
- **Description**: Update penalty on existing solve
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "penalty_type": "+2"
  }
  ```
- **Response Payload**: Updated solve object
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized
  - `403`: Can only update own solves
  - `422`: Invalid penalty type

#### Delete Solve (Soft Delete)
- **Method**: `PATCH`
- **URL**: `/rest/v1/solves?id=eq.{solve_id}`
- **Description**: Soft delete a solve
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "deleted_at": "2025-01-16T14:00:00Z"
  }
  ```
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized
  - `403`: Can only delete own solves

#### Bulk Delete Solves (Soft Delete)
- **Method**: `PATCH`
- **URL**: `/rest/v1/solves?id=in.({solve_id1},{solve_id2},...)`
- **Description**: Soft delete multiple solves
- **Headers**: `Authorization: Bearer {access_token}`
- **Request Payload**:
  ```json
  {
    "deleted_at": "2025-01-16T14:00:00Z"
  }
  ```
- **Success**: `200 OK`
- **Errors**:
  - `401`: Unauthorized
  - `403`: Can only delete own solves

#### Get Solve Count
- **Method**: `GET`
- **URL**: `/rest/v1/solves?user_id=eq.{user_id}&deleted_at=is.null&select=count`
- **Description**: Get total solve count for storage limit check
- **Headers**:
  - `Authorization: Bearer {access_token}`
  - `Prefer: count=exact`
- **Response Headers**:
  - `Content-Range`: `0-0/{total_count}`
- **Success**: `200 OK`

---

## 3. Authentication and Authorization

### Authentication Mechanism

**Implementation**: Supabase Auth with JWT tokens

1. **User Registration**:
   - Email/password signup via Supabase Auth
   - Automatic email verification sent
   - Profile auto-created via database trigger (`on_auth_user_created`)

2. **Session Management**:
   - JWT access tokens (1 hour expiry by default)
   - Refresh tokens for session persistence
   - "Remember me" extends session to 30 days

3. **Token Usage**:
   - Access token passed in `Authorization: Bearer {token}` header
   - Supabase client automatically handles token refresh

### Authorization (Row Level Security)

All authorization is enforced at the database level via RLS policies:

#### Profiles Table Policies
| Policy | Description | Condition |
|--------|-------------|-----------|
| View own profile | Users can always see their own profile | `auth.uid() = id` |
| View public profiles | Anyone can view public profiles | `profile_visibility = true AND deleted_at IS NULL` |
| Update own profile | Users can only update their own profile | `auth.uid() = id` |
| Service role insert | Profile created on signup via trigger | `role() = 'service_role'` |

#### Solves Table Policies
| Policy | Description | Condition |
|--------|-------------|-----------|
| View own solves | Users can only see their own solves | `auth.uid() = user_id` |
| Insert own solves | Users can only create their own solves | `auth.uid() = user_id` |
| Update own solves | Users can only update their own solves | `auth.uid() = user_id` |
| Delete own solves | Users can only delete their own solves | `auth.uid() = user_id` |

### Security Headers

All requests should include:
- `apikey`: Supabase anon key (always required)
- `Authorization`: Bearer token (for authenticated requests)
- `Content-Type`: application/json (for POST/PATCH)

---

## 4. Validation and Business Logic

### Validation Rules

#### Profile Validation
| Field | Validation | Error Message |
|-------|------------|---------------|
| `username` | Required, 3-30 characters | "Username must be 3-30 characters" |
| `username` | Pattern: `^[a-zA-Z0-9_-]+$` | "Username can only contain letters, numbers, underscores, and hyphens" |
| `username` | Unique | "Username already taken" |
| `profile_visibility` | Boolean | "Invalid visibility value" |
| `pb_single` | Positive integer or null | "Invalid time value" |
| `pb_ao5` | Positive integer or null | "Invalid average value" |
| `pb_ao12` | Positive integer or null | "Invalid average value" |
| `total_solves` | Non-negative integer | "Invalid solve count" |

#### Solve Validation
| Field | Validation | Error Message |
|-------|------------|---------------|
| `time_ms` | Required, positive integer | "Time must be a positive number" |
| `scramble` | Required, non-empty string | "Scramble is required" |
| `penalty_type` | One of: `null`, `"+2"`, `"DNF"` | "Invalid penalty type" |
| `user_id` | Must match authenticated user | "Cannot create solves for other users" |

### Business Logic (Application-Side)

The following business logic is handled by the React frontend, not the API:

#### Statistics Calculation
- **Ao5**: Average of middle 3 times from last 5 solves (excluding best and worst)
- **Ao12**: Average of middle 10 times from last 12 solves
- **Ao100**: Average of middle 90 times from last 100 solves
- **DNF handling**: DNF counts as worst time in averages; 2+ DNFs = DNF average
- **+2 handling**: Add 2000ms to `time_ms` for effective time

#### Personal Best Detection
- Compare new solve/average against stored PB values
- Update profile if new record achieved
- Track date and scramble for PB single

#### Solve Limit Enforcement
- Check count before insert
- Warn at 9,500 solves
- Block new solves at 10,000 (or auto-delete oldest)

#### Session Detection
- Solves grouped by time gaps (>30 minutes = new session)
- Session statistics calculated client-side

### API Response Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| `200 OK` | Success | GET, PATCH |
| `201 Created` | Resource created | POST |
| `204 No Content` | Success, no body | DELETE |
| `400 Bad Request` | Invalid request format | Malformed JSON |
| `401 Unauthorized` | Missing/invalid auth | No token or expired |
| `403 Forbidden` | Insufficient permissions | RLS policy violation |
| `404 Not Found` | Resource doesn't exist | Invalid ID |
| `409 Conflict` | Constraint violation | Duplicate username |
| `422 Unprocessable Entity` | Validation error | Invalid field values |
| `429 Too Many Requests` | Rate limited | Excessive requests |

### Rate Limiting

Supabase provides default rate limiting:
- Anonymous requests: 100 requests/minute
- Authenticated requests: 1000 requests/minute

Application should implement additional client-side throttling for:
- Solve creation: Max 1 per second
- Profile updates: Max 1 per 5 seconds

---

## 5. Data Flow Examples

### Recording a Solve
```
1. User completes solve in timer UI
2. Client calculates effective time (applies +2 if set)
3. Client POSTs to /rest/v1/solves
4. Client recalculates Ao5, Ao12 locally
5. If new PB detected, client PATCHes /rest/v1/profiles
6. UI updates with new statistics
```

### Viewing Public Profile
```
1. Visitor navigates to /u/{username}
2. Client GETs /rest/v1/profiles?username=eq.{username}&profile_visibility=eq.true
3. If found and public, client displays profile data
4. Client GETs recent solves (last 10) for activity feed
5. If not found or private, display appropriate message
```

### Managing Solve History
```
1. User navigates to history view
2. Client GETs /rest/v1/solves with pagination
3. User applies penalty to solve
4. Client PATCHes /rest/v1/solves?id=eq.{id}
5. Client recalculates affected averages
6. User deletes solve
7. Client PATCHes solve with deleted_at timestamp
8. Client recalculates statistics, updates profile if PB affected
```
