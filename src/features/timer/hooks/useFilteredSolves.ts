import { useMemo, useState, useEffect } from 'react';
import { subDays, subYears } from 'date-fns';
import { useAsync } from '../../../shared/hooks/useAsync';
import { getUserSolves } from '../services/solvesService';
import { supabase } from '../../../db/supabase';
import type { SolveDTO } from '../types/timer.types';
import type { DateRange } from '../components/DateRangeSelector';

/**
 * Get cutoff date based on date range selection
 */
function getCutoffDate(range: DateRange): Date | null {
  const now = new Date();

  switch (range) {
    case '7d':
      return subDays(now, 7);
    case '30d':
      return subDays(now, 30);
    case '90d':
      return subDays(now, 90);
    case '1y':
      return subYears(now, 1);
    case 'all':
      return null;
    default:
      return null;
  }
}

/**
 * Custom hook for fetching solves filtered by date range
 *
 * Fetches user's solve history and filters by selected date range.
 * Returns filtered solves, loading state, and error state.
 *
 * @param dateRange - The date range to filter by
 * @returns Filtered solves with loading and error states
 *
 * @example
 * const { solves, loading, error } = useFilteredSolves('30d');
 */
export function useFilteredSolves(dateRange: DateRange) {
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getUserId();
  }, []);

  // Fetch solves (fetch a large number to ensure we get all for filtering)
  const {
    data: allSolves,
    loading,
    error,
    execute: refetch,
  } = useAsync<SolveDTO[]>(
    async () => {
      if (!userId) return [];
      // Fetch up to 1000 solves (should be enough for most users)
      return getUserSolves(userId, 1000, 0);
    },
    { immediate: !!userId }
  );

  // Filter solves by date range
  const filteredSolves = useMemo(() => {
    if (!allSolves) return [];

    const cutoffDate = getCutoffDate(dateRange);

    // If no cutoff (all time), return all solves
    if (!cutoffDate) {
      return allSolves;
    }

    // Filter solves after cutoff date
    return allSolves.filter((solve) => {
      const solveDate = new Date(solve.created_at);
      return solveDate >= cutoffDate;
    });
  }, [allSolves, dateRange]);

  return {
    solves: filteredSolves,
    loading,
    error,
    refetch,
  };
}
