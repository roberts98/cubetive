import { supabase } from '../../../db/supabase';
import type { ProfileDTO, PublicProfileWithSolves, PublicSolveDTO } from '../../../types';

/**
 * Fetches the authenticated user's complete profile data from Supabase.
 *
 * This function retrieves the current user's profile by:
 * 1. Getting the authenticated user from Supabase Auth
 * 2. Querying the profiles table filtered by user ID
 * 3. Excluding soft-deleted profiles
 *
 * Row Level Security (RLS) enforces that users can only access their own profile.
 *
 * @returns {Promise<ProfileDTO>} The user's complete profile data
 * @throws {Error} 'Unauthorized' if no user is authenticated
 * @throws {Error} 'Profile not found' if the profile doesn't exist or is deleted
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * try {
 *   const profile = await getCurrentUserProfile();
 *   console.log(`Username: ${profile.username}`);
 * } catch (error) {
 *   console.error('Failed to load profile:', error);
 * }
 */
export async function getCurrentUserProfile(): Promise<ProfileDTO> {
  // Step 1: Get authenticated user from Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication error: ${authError.message}`);
  }

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Step 2: Query the profiles table for the authenticated user
  // Select all fields except deleted_at (as per ProfileDTO type)
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, username, profile_visibility, total_solves, pb_single, pb_single_date, pb_single_scramble, pb_ao5, pb_ao5_date, pb_ao12, pb_ao12_date, created_at, updated_at'
    )
    .eq('id', user.id)
    .is('deleted_at', null)
    .single();

  // Step 3: Handle query errors
  if (error) {
    // PGRST116 is PostgREST's error code for "no rows returned"
    if (error.code === 'PGRST116') {
      throw new Error('Profile not found');
    }
    throw error;
  }

  // Step 4: Validate data exists (defensive check)
  if (!data) {
    throw new Error('Profile not found');
  }

  return data as ProfileDTO;
}

/**
 * Checks if a username is available for registration.
 *
 * This function queries the profiles table to see if a username is already taken.
 * Used during registration to prevent duplicate usernames.
 *
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} true if username is available, false if taken
 *
 * @example
 * const available = await checkUsernameAvailability('speedcuber123');
 * if (!available) {
 *   console.error('Username is already taken');
 * }
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .is('deleted_at', null)
    .maybeSingle();

  // If error occurred (other than no rows), consider username unavailable for safety
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking username availability:', error);
    return false;
  }

  // If data exists, username is taken
  if (data) {
    return false;
  }

  // No data found, username is available
  return true;
}

/**
 * Updates the username for a given user.
 *
 * First checks if the new username is available, then updates the profile.
 * This is used in profile settings when a user wants to change their username.
 *
 * @param {string} userId - The user's ID (from auth.users)
 * @param {string} newUsername - The new username to set
 * @returns {Promise<void>}
 * @throws {Error} 'Username is already taken' if username exists
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * try {
 *   await updateUsername(user.id, 'new_username');
 * } catch (error) {
 *   console.error('Failed to update username:', error);
 * }
 */
export async function updateUsername(userId: string, newUsername: string): Promise<void> {
  // Check if username is available
  const isAvailable = await checkUsernameAvailability(newUsername);
  if (!isAvailable) {
    throw new Error('Username is already taken');
  }

  // Update the username
  const { error } = await supabase
    .from('profiles')
    .update({ username: newUsername })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Updates the profile visibility (public/private) for a given user.
 *
 * This allows users to toggle whether their profile is publicly accessible.
 * Used in profile settings to control profile visibility.
 *
 * @param {string} userId - The user's ID (from auth.users)
 * @param {boolean} isPublic - Whether the profile should be public
 * @returns {Promise<void>}
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * try {
 *   await updateProfileVisibility(user.id, true);
 * } catch (error) {
 *   console.error('Failed to update profile visibility:', error);
 * }
 */
export async function updateProfileVisibility(userId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_visibility: isPublic })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Fetches a public profile by username.
 *
 * This function retrieves a user's public profile data along with their recent solves.
 * No authentication is required to access public profiles.
 * If the profile is private, the function still returns the profile but with profile_visibility=false,
 * allowing the UI to display a "Profile is private" message.
 *
 * @param {string} username - The username to look up
 * @returns {Promise<PublicProfileWithSolves | null>} The public profile with recent solves, or null if not found
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * try {
 *   const profile = await getPublicProfile('speedcuber123');
 *   if (profile && profile.profile_visibility) {
 *     console.log(`Best single: ${profile.pb_single}ms`);
 *     console.log(`Recent solves: ${profile.recent_solves.length}`);
 *   } else if (profile) {
 *     console.log('Profile is private');
 *   } else {
 *     console.log('Profile not found');
 *   }
 * } catch (error) {
 *   console.error('Failed to load public profile:', error);
 * }
 */
export async function getPublicProfile(username: string): Promise<PublicProfileWithSolves | null> {
  // Step 1: Query the profiles table for the username
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(
      'username, profile_visibility, pb_single, pb_ao5, pb_ao12, total_solves, created_at, id'
    )
    .eq('username', username)
    .is('deleted_at', null)
    .maybeSingle();

  // Step 2: Handle profile query errors
  if (profileError) {
    throw profileError;
  }

  // Step 3: Return null if profile doesn't exist
  if (!profileData) {
    return null;
  }

  // Step 4: Fetch recent solves (last 10) if profile is public
  let recentSolves: PublicSolveDTO[] = [];

  if (profileData.profile_visibility) {
    const { data: solvesData, error: solvesError } = await supabase
      .from('solves')
      .select('time_ms, penalty_type, created_at')
      .eq('user_id', profileData.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (solvesError) {
      throw solvesError;
    }

    recentSolves = (solvesData as PublicSolveDTO[]) || [];
  }

  // Step 5: Return combined profile with recent solves
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...publicProfile } = profileData;
  return {
    ...publicProfile,
    recent_solves: recentSolves,
  };
}
