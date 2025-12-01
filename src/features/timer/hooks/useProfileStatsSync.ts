/**
 * useProfileStatsSync Hook
 *
 * Manages automatic profile statistics updates after each solve.
 * Calculates new PBs and averages, compares with profile stats,
 * and updates the profile when improvements are detected.
 */

import { useRef } from 'react';
import { useAuthStore } from '../../auth/stores/authStore';
import { useUpdateProfileStats } from '../../profile/hooks/useUpdateProfileStats';
import { getRecentSolves } from '../services/solvesService';
import { getCurrentUserProfile } from '../../profile/services/profileService';
import {
  findPersonalBest,
  findBestAo5,
  findBestAo12,
  isNewPersonalBest,
} from '../utils/statistics';
import { showSuccess } from '../../../shared/utils/notifications';
import { triggerRefresh } from '../../../shared/hooks/useDataRefresh';
import type { UpdateProfileStatsCommand } from '../../../types';

interface NewRecords {
  newPBSingle: boolean;
  newPBAo5: boolean;
  newPBAo12: boolean;
}

/**
 * Hook for syncing profile stats after solves
 *
 * Automatically fetches recent solves, calculates statistics,
 * and updates profile when new personal bests are achieved.
 *
 * @returns {Object} Sync utilities
 * @returns {Function} syncAfterSolve - Call after saving a solve to update profile stats
 * @returns {boolean} syncing - True while sync is in progress
 *
 * @example
 * const { syncAfterSolve, syncing } = useProfileStatsSync();
 *
 * const handleSolveComplete = async () => {
 *   await saveSolve(...);
 *   await syncAfterSolve(); // Updates profile stats if needed
 * };
 */
export function useProfileStatsSync() {
  const user = useAuthStore((state) => state.user);
  const { execute: updateStats } = useUpdateProfileStats();
  const syncingRef = useRef(false);

  /**
   * Syncs profile statistics after a solve is saved
   *
   * This function:
   * 1. Fetches recent 100 solves for stats calculation
   * 2. Calculates current PB single, Ao5, and Ao12
   * 3. Compares with profile's stored stats
   * 4. Updates profile if any improvements found
   * 5. Shows celebration notifications for new PBs
   */
  const syncAfterSolve = async (): Promise<void> => {
    // Guard: Ensure user is authenticated
    if (!user) {
      console.error('Cannot sync profile stats: User not authenticated');
      return;
    }

    // Guard: Prevent concurrent syncs
    if (syncingRef.current) {
      console.log('Profile sync already in progress, skipping');
      return;
    }

    syncingRef.current = true;

    try {
      // Step 1: Fetch current profile to get existing stats
      const profile = await getCurrentUserProfile();

      // Step 2: Fetch recent 100 solves for stats calculation
      const recentSolves = await getRecentSolves(user.id, 100);

      if (recentSolves.length === 0) {
        console.log('No solves found, skipping stats sync');
        syncingRef.current = false;
        return;
      }

      // Step 3: Convert to chronological order (oldest → newest)
      // getRecentSolves returns newest first, but stats functions expect oldest first
      const chronologicalSolves = [...recentSolves].reverse();

      // Step 4: Calculate new statistics
      const newPBSolve = findPersonalBest(chronologicalSolves);
      const newBestAo5 = findBestAo5(chronologicalSolves);
      const newBestAo12 = findBestAo12(chronologicalSolves);

      // Step 5: Prepare stats update command (only update what changed)
      const statsUpdate: UpdateProfileStatsCommand = {
        total_solves: recentSolves.length,
      };

      // Track which records were broken
      const newRecords: NewRecords = {
        newPBSingle: false,
        newPBAo5: false,
        newPBAo12: false,
      };

      // Check and update PB single
      if (newPBSolve) {
        const effectiveTime =
          newPBSolve.penalty_type === '+2' ? newPBSolve.time_ms + 2000 : newPBSolve.time_ms;

        if (isNewPersonalBest(effectiveTime, profile.pb_single)) {
          statsUpdate.pb_single = effectiveTime;
          statsUpdate.pb_single_date = newPBSolve.created_at;
          statsUpdate.pb_single_scramble = newPBSolve.scramble;
          newRecords.newPBSingle = true;
        }
      }

      // Check and update PB Ao5
      if (newBestAo5) {
        if (!profile.pb_ao5 || newBestAo5.average < profile.pb_ao5) {
          statsUpdate.pb_ao5 = newBestAo5.average;
          statsUpdate.pb_ao5_date = newBestAo5.date;
          newRecords.newPBAo5 = true;
        }
      }

      // Check and update PB Ao12
      if (newBestAo12) {
        if (!profile.pb_ao12 || newBestAo12.average < profile.pb_ao12) {
          statsUpdate.pb_ao12 = newBestAo12.average;
          statsUpdate.pb_ao12_date = newBestAo12.date;
          newRecords.newPBAo12 = true;
        }
      }

      // Step 6: Update profile with new stats
      await updateStats(statsUpdate);

      // Step 7: Trigger refresh events to notify UI components
      // This causes dashboard and profile page to refetch their data
      triggerRefresh('solves'); // Notify components displaying solve data
      triggerRefresh('profile'); // Notify components displaying profile stats

      // Step 8: Show celebration notifications for new PBs
      showCelebrationNotifications(newRecords, statsUpdate);

      console.log('Profile stats synced successfully', statsUpdate);
    } catch (error) {
      // Silently log errors - solve is already saved, stats update is secondary
      console.error('Failed to sync profile stats:', error);
    } finally {
      syncingRef.current = false;
    }
  };

  return {
    syncAfterSolve,
    syncing: syncingRef.current,
  };
}

/**
 * Shows celebration notifications for new personal bests
 */
function showCelebrationNotifications(
  newRecords: NewRecords,
  statsUpdate: UpdateProfileStatsCommand
): void {
  // Format time for display (ms to seconds.hundredths)
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${seconds}.${hundredths.toString().padStart(2, '0')}s`;
  };

  // Show individual notifications for each type of PB
  if (newRecords.newPBSingle && statsUpdate.pb_single) {
    showSuccess(`New Personal Best Single: ${formatTime(statsUpdate.pb_single)}`, {
      autoClose: 5000,
    });
  }

  if (newRecords.newPBAo5 && statsUpdate.pb_ao5) {
    showSuccess(`New Personal Best Ao5: ${formatTime(statsUpdate.pb_ao5)}`, {
      autoClose: 5000,
    });
  }

  if (newRecords.newPBAo12 && statsUpdate.pb_ao12) {
    showSuccess(`New Personal Best Ao12: ${formatTime(statsUpdate.pb_ao12)}`, {
      autoClose: 5000,
    });
  }
}
