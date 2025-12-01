/**
 * Custom hook for fetching user's solve history with pagination
 */

import { useAsync } from '../../../shared/hooks/useAsync';
import { getUserSolves } from '../services/solvesService';
import type { SolveDTO } from '../types/timer.types';
import { useAuthStore } from '../../auth/stores/authStore';

/**
 * Hook for fetching paginated solve history
 *
 * @param limit - Number of solves per page (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @returns Async state with solve history data
 *
 * @example
 * const { data: solves, loading, error, execute: refetch } = useSolveHistory(50, 0);
 */
export function useSolveHistory(limit: number = 50, offset: number = 0) {
  const user = useAuthStore((state) => state.user);

  return useAsync<SolveDTO[]>(() => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return getUserSolves(user.id, limit, offset);
  });
}
