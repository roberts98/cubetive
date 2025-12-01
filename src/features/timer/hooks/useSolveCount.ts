/**
 * Custom hook for fetching user's total solve count
 */

import { useAsync } from '../../../shared/hooks/useAsync';
import { getSolveCount } from '../services/solvesService';
import { useAuthStore } from '../../auth/stores/authStore';

/**
 * Hook for fetching total solve count
 *
 * @returns Async state with solve count
 *
 * @example
 * const { data: count, loading, error, execute: refetch } = useSolveCount();
 */
export function useSolveCount() {
  const user = useAuthStore((state) => state.user);

  return useAsync<number>(() => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    return getSolveCount(user.id);
  });
}
