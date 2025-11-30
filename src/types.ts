import type { Database } from './db/database.types';

// =============================================================================
// Base Entity Types (derived from database)
// =============================================================================

/** Profile row type from database */
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/** Solve row type from database */
type SolveRow = Database['public']['Tables']['solves']['Row'];

// =============================================================================
// Penalty Type
// =============================================================================

/** Valid penalty types for solves: null (no penalty), +2, or DNF */
export type PenaltyType = null | '+2' | 'DNF';

// =============================================================================
// Profile DTOs
// =============================================================================

/**
 * Full profile DTO returned for authenticated user's own profile
 * GET /rest/v1/profiles?id=eq.{user_id}
 */
export type ProfileDTO = Omit<ProfileRow, 'deleted_at'>;

/**
 * Public profile DTO with limited fields for unauthenticated access
 * GET /rest/v1/profiles?username=eq.{username}&profile_visibility=eq.true
 */
export type PublicProfileDTO = Pick<
  ProfileRow,
  'username' | 'pb_single' | 'pb_ao5' | 'pb_ao12' | 'total_solves' | 'created_at'
>;

// =============================================================================
// Profile Command Models
// =============================================================================

/**
 * Command model for updating profile settings (username, visibility)
 * PATCH /rest/v1/profiles?id=eq.{user_id}
 */
export type UpdateProfileCommand = Pick<ProfileRow, 'username' | 'profile_visibility'>;

/**
 * Command model for updating profile statistics after a new PB
 * PATCH /rest/v1/profiles?id=eq.{user_id}
 */
export type UpdateProfileStatsCommand = Partial<
  Pick<
    ProfileRow,
    | 'pb_single'
    | 'pb_single_date'
    | 'pb_single_scramble'
    | 'pb_ao5'
    | 'pb_ao5_date'
    | 'pb_ao12'
    | 'pb_ao12_date'
    | 'total_solves'
  >
>;

/**
 * Command model for soft deleting a profile
 * PATCH /rest/v1/profiles?id=eq.{user_id}
 */
export type DeleteProfileCommand = Pick<ProfileRow, 'deleted_at'>;

// =============================================================================
// Solve DTOs
// =============================================================================

/**
 * Full solve DTO returned for authenticated user's own solves
 * GET /rest/v1/solves?user_id=eq.{user_id}
 */
export type SolveDTO = Omit<SolveRow, 'deleted_at'> & {
  penalty_type: PenaltyType;
};

/**
 * Public solve DTO with limited fields for public profile views
 * GET /rest/v1/solves (for public profiles, last 10 solves)
 */
export type PublicSolveDTO = Pick<SolveRow, 'time_ms' | 'created_at'> & {
  penalty_type: PenaltyType;
};

// =============================================================================
// Solve Command Models
// =============================================================================

/**
 * Command model for creating a new solve
 * POST /rest/v1/solves
 */
export type CreateSolveCommand = {
  user_id: SolveRow['user_id'];
  time_ms: SolveRow['time_ms'];
  scramble: SolveRow['scramble'];
  penalty_type: PenaltyType;
};

/**
 * Command model for updating a solve's penalty
 * PATCH /rest/v1/solves?id=eq.{solve_id}
 */
export type UpdateSolvePenaltyCommand = {
  penalty_type: PenaltyType;
};

/**
 * Command model for soft deleting a solve
 * PATCH /rest/v1/solves?id=eq.{solve_id}
 */
export type DeleteSolveCommand = Pick<SolveRow, 'deleted_at'>;

/**
 * Command model for bulk soft deleting solves
 * PATCH /rest/v1/solves?id=in.({ids})
 */
export type BulkDeleteSolvesCommand = Pick<SolveRow, 'deleted_at'>;

// =============================================================================
// Pagination Types
// =============================================================================

/**
 * Pagination parameters for list endpoints
 */
export type PaginationParams = {
  limit?: number;
  offset?: number;
};

/**
 * Sort order for solve list queries
 */
export type SolveSortOrder = 'created_at.desc' | 'created_at.asc';

/**
 * Query parameters for listing solves
 */
export type ListSolvesParams = PaginationParams & {
  order?: SolveSortOrder;
};

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Paginated response wrapper with content range info
 */
export type PaginatedResponse<T> = {
  data: T[];
  count: number;
};

// =============================================================================
// Statistics Types (Client-side calculation)
// =============================================================================

/**
 * Calculated statistics for a session or overall
 * These are computed client-side, not stored in the database
 */
export type CalculatedStats = {
  ao5: number | null;
  ao12: number | null;
  ao100: number | null;
  best: number | null;
  worst: number | null;
  mean: number | null;
  solveCount: number;
};

/**
 * Session grouping type for client-side session detection
 * Sessions are grouped by time gaps (>30 minutes = new session)
 */
export type SolveSession = {
  startTime: string;
  endTime: string;
  solves: SolveDTO[];
  stats: CalculatedStats;
};
