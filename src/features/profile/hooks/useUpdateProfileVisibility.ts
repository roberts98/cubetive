import { useState } from 'react';
import { updateProfileVisibility } from '../services/profileService';
import { useAuthStore } from '../../auth/stores/authStore';

/**
 * Custom React hook for updating profile visibility setting.
 *
 * This hook handles loading, error, and data states while updating
 * the user's profile visibility (public/private) in Supabase.
 *
 * @returns {Object} Update state and controls
 * @returns {boolean} loading - True while the update is in progress
 * @returns {Error | null} error - Error object if update failed, otherwise null
 * @returns {Function} execute - Function to trigger profile visibility update with isPublic parameter
 *
 * @example
 * function ProfileSettings() {
 *   const { loading, error, execute: updateVisibility } = useUpdateProfileVisibility();
 *
 *   const handleToggle = async (isPublic: boolean) => {
 *     try {
 *       await updateVisibility(isPublic);
 *       showSuccess('Profile visibility updated');
 *     } catch (err) {
 *       showError('Failed to update visibility');
 *     }
 *   };
 *
 *   return (
 *     <Switch
 *       disabled={loading}
 *       onChange={(e) => handleToggle(e.target.checked)}
 *     />
 *   );
 * }
 */
export function useUpdateProfileVisibility() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (isPublic: boolean): Promise<void> => {
    if (!user) {
      const authError = new Error('User not authenticated');
      setError(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);

    try {
      await updateProfileVisibility(user.id, isPublic);
      setLoading(false);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update visibility');
      setError(errorObj);
      setLoading(false);
      throw errorObj;
    }
  };

  return {
    loading,
    error,
    execute,
  };
}
