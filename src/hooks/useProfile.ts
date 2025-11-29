import { getCurrentUserProfile } from '../services/profileService';
import { useAsync } from './useAsync';
import type { ProfileDTO } from '../types';

/**
 * Custom React hook for fetching and managing the current user's profile.
 *
 * This hook leverages the useAsync hook to handle loading, error, and data states
 * while fetching the authenticated user's profile from Supabase.
 *
 * @returns {Object} Profile state and controls
 * @returns {ProfileDTO | null} data - The user's profile data, or null if not loaded
 * @returns {boolean} loading - True while the profile is being fetched
 * @returns {Error | null} error - Error object if fetching failed, otherwise null
 * @returns {Function} execute - Function to manually trigger a profile refetch
 * @returns {Function} reset - Function to reset the profile state
 *
 * @example
 * function ProfileDashboard() {
 *   const { data: profile, loading, error, execute: refetch } = useCurrentProfile();
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error.message} />;
 *   if (!profile) return null;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {profile.username}!</h1>
 *       <button onClick={refetch}>Refresh Profile</button>
 *     </div>
 *   );
 * }
 */
export function useCurrentProfile() {
  return useAsync<ProfileDTO>(getCurrentUserProfile);
}
