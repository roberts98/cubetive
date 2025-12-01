import { getPublicProfile } from '../services/profileService';
import { useAsync } from '../../../shared/hooks/useAsync';
import type { PublicProfileWithSolves } from '../../../types';

/**
 * Custom React hook for fetching a public profile by username.
 *
 * This hook leverages the useAsync hook to handle loading, error, and data states
 * while fetching a user's public profile from Supabase.
 * No authentication is required to fetch public profiles.
 *
 * @param {string} username - The username of the profile to fetch
 * @returns {Object} Profile state and controls
 * @returns {PublicProfileWithSolves | null} data - The public profile data with recent solves, or null if not loaded/not found
 * @returns {boolean} loading - True while the profile is being fetched
 * @returns {Error | null} error - Error object if fetching failed, otherwise null
 * @returns {Function} execute - Function to manually trigger a profile refetch
 * @returns {Function} reset - Function to reset the profile state
 *
 * @example
 * function PublicProfilePage() {
 *   const { username } = useParams();
 *   const { data: profile, loading, error } = usePublicProfile(username);
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error.message} />;
 *   if (!profile) return <NotFoundMessage />;
 *   if (!profile.profile_visibility) return <PrivateProfileMessage />;
 *
 *   return <PublicProfileCard profile={profile} />;
 * }
 */
export function usePublicProfile(username: string) {
  return useAsync<PublicProfileWithSolves | null>(() => getPublicProfile(username));
}
