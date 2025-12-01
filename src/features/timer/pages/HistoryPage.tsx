/**
 * HistoryPage
 *
 * Displays user's complete solve history with pagination and delete functionality.
 */

import { useState, useEffect } from 'react';
import { Typography, Box, Alert, Chip } from '@mui/material';
import { PageLayout } from '../../../shared/components';
import SolveHistoryTable from '../components/SolveHistoryTable';
import { useSolveHistory } from '../hooks/useSolveHistory';
import { useSolveCount } from '../hooks/useSolveCount';
import { useDeleteSolve } from '../hooks/useDeleteSolve';
import { showSuccess, showError } from '../../../shared/utils/notifications';

const PAGE_SIZE = 50;

/**
 * HistoryPage Component
 *
 * Main page for viewing solve history with pagination.
 * Allows users to view all their past solves and delete individual solves.
 */
function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingSolveId, setDeletingSolveId] = useState<string | undefined>(undefined);

  // Calculate offset for pagination
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch solve history
  const {
    data: solves,
    loading: solvesLoading,
    error: solvesError,
    execute: refetchSolves,
  } = useSolveHistory(PAGE_SIZE, offset);

  // Fetch total solve count
  const {
    data: totalCount,
    loading: countLoading,
    error: countError,
    execute: refetchCount,
  } = useSolveCount();

  // Delete solve hook
  const { execute: performDelete } = useDeleteSolve();

  // Refetch data when page changes
  useEffect(() => {
    void refetchSolves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle delete solve
   */
  const handleDelete = async (solveId: string) => {
    try {
      setDeletingSolveId(solveId);
      await performDelete(solveId);

      showSuccess('Solve deleted successfully');

      // Refetch data to update the list and count
      await Promise.all([refetchSolves(), refetchCount()]);

      // If current page is now empty and not the first page, go to previous page
      if (solves && solves.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete solve';
      showError(errorMessage);
    } finally {
      setDeletingSolveId(undefined);
    }
  };

  // Loading state for count
  const isLoading = solvesLoading || countLoading;

  return (
    <PageLayout maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solve History
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            View and manage your complete solve history
          </Typography>
          {totalCount !== null && (
            <Chip
              label={`${totalCount.toLocaleString()} ${totalCount === 1 ? 'solve' : 'solves'}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Error alerts */}
      {countError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Failed to load total solve count
        </Alert>
      )}

      {/* Solve History Table */}
      <SolveHistoryTable
        solves={solves || []}
        loading={isLoading}
        error={solvesError}
        totalCount={totalCount || 0}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        isDeletingSolveId={deletingSolveId}
      />

      {/* Storage warning */}
      {totalCount !== null && totalCount >= 9500 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {totalCount >= 10000
            ? 'Storage limit reached (10,000 solves). Please delete old solves to continue.'
            : `Approaching storage limit (${totalCount.toLocaleString()}/10,000 solves). Consider deleting old solves.`}
        </Alert>
      )}
    </PageLayout>
  );
}

export default HistoryPage;
