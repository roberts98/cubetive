import { useState } from 'react';
import { updateProfileStats } from '../services/profileService';
import { useAuthStore } from '../../auth/stores/authStore';
import type { UpdateProfileStatsCommand } from '../../../types';

/**
 * Custom React hook for updating profile statistics after solves.
 *
 * This hook handles loading, error, and data states while updating
 * the user's profile statistics (PBs, averages, solve counts) in Supabase.
 * It's automatically called after each solve to keep profile stats current.
 *
 * @returns {Object} Update state and controls
 * @returns {boolean} loading - True while the update is in progress
 * @returns {Error | null} error - Error object if update failed, otherwise null
 * @returns {Function} execute - Function to trigger profile stats update with stats parameter
 *
 * @example
 * function TimerComponent() {
 *   const { loading, error, execute: updateStats } = useUpdateProfileStats();
 *
 *   const handleSolveComplete = async (solve: SolveDTO) => {
 *     // Calculate new stats
 *     const stats: UpdateProfileStatsCommand = {
 *       pb_single: 8540,
 *       pb_single_date: '2025-12-01T10:30:00Z',
 *       pb_single_scramble: "D2 F' U2 L2...",
 *       total_solves: 150
 *     };
 *
 *     try {
 *       await updateStats(stats);
 *       console.log('Profile stats updated successfully');
 *     } catch (err) {
 *       console.error('Failed to update profile stats:', err);
 *       // Silently fail - solve is already saved
 *     }
 *   };
 *
 *   return <Timer onComplete={handleSolveComplete} />;
 * }
 */
export function useUpdateProfileStats() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (stats: UpdateProfileStatsCommand): Promise<void> => {
    if (!user) {
      const authError = new Error('User not authenticated');
      setError(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);

    try {
      await updateProfileStats(user.id, stats);
      setLoading(false);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update profile stats');
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
