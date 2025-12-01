import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { PublicSolveDTO } from '../../../types';
import { TimeDisplay } from '../../../shared/components';
import { formatDateShort, formatTimeOfDay } from '../../../shared/utils/formatters';

interface RecentSolvesDisplayProps {
  solves: PublicSolveDTO[];
}

/**
 * RecentSolvesDisplay
 *
 * Displays a list of recent solves with times, penalties, and dates.
 * Used on public profile pages to show the last 10 solves.
 */
export function RecentSolvesDisplay({ solves }: RecentSolvesDisplayProps) {
  if (solves.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Solves
        </Typography>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No recent solves yet
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Recent Solves
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time of Day</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solves.map((solve, index) => (
              <TableRow key={`${solve.created_at}-${index}`} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TimeDisplay
                    timeMs={solve.time_ms}
                    penaltyType={solve.penalty_type}
                    variant="body1"
                  />
                </TableCell>
                <TableCell>{formatDateShort(solve.created_at)}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatTimeOfDay(solve.created_at)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
