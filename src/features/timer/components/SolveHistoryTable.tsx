/**
 * SolveHistoryTable Component
 *
 * Displays a paginated table of solve records with delete functionality.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Pagination,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { SolveDTO } from '../types/timer.types';
import SolveRow from './SolveRow';

interface SolveHistoryTableProps {
  solves: SolveDTO[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDelete: (solveId: string) => void;
  isDeletingSolveId?: string;
}

export default function SolveHistoryTable({
  solves,
  loading,
  error,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onDelete,
  isDeletingSolveId,
}: SolveHistoryTableProps) {
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load solve history: {error.message}
      </Alert>
    );
  }

  // Empty state
  if (solves.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No solves yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start timing to see your solve history here
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  Time
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  Date
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="bold">
                  Scramble
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solves.map((solve) => (
              <SolveRow
                key={solve.id}
                solve={solve}
                onDelete={onDelete}
                isDeleting={isDeletingSolveId === solve.id}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}
