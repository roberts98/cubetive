/**
 * Custom hook for deleting a solve
 */

import { useAsync } from '../../../shared/hooks/useAsync';
import { deleteSolve } from '../services/solvesService';

/**
 * Hook for deleting a solve
 *
 * Provides manual execution only (immediate: false) since deletion
 * should only happen when user explicitly triggers it.
 *
 * @returns Async state with execute function for deletion
 *
 * @example
 * const { loading, error, execute: performDelete } = useDeleteSolve();
 *
 * const handleDelete = async (solveId: string) => {
 *   await performDelete(solveId);
 * };
 */
export function useDeleteSolve() {
  const asyncState = useAsync<void>(
    async () => {
      // This will be replaced by the actual solveId when execute is called
      throw new Error('No solve ID provided');
    },
    { immediate: false }
  );

  /**
   * Execute deletion for a specific solve ID
   */
  const executeDelete = async (solveId: string) => {
    // Create a new async function with the actual solveId
    const deleteFunction = () => deleteSolve(solveId);

    // Manually execute the deletion
    asyncState.reset();
    await deleteFunction();
  };

  return {
    loading: asyncState.loading,
    error: asyncState.error,
    execute: executeDelete,
  };
}
