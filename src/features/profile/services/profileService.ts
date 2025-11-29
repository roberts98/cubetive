import { supabase } from '../../../db/supabase';
import type { ProfileDTO } from '../../../types';

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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

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
    .select('id, username, profile_visibility, total_solves, pb_single, pb_single_date, pb_single_scramble, pb_ao5, pb_ao5_date, pb_ao12, pb_ao12_date, created_at, updated_at')
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
