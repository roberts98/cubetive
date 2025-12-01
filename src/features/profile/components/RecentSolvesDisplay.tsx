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
  /**
   * Formats time in milliseconds to user-friendly format (seconds.hundredths)
   */
  const formatTime = (timeMs: number, penaltyType: PublicSolveDTO['penalty_type']): string => {
    if (penaltyType === 'DNF') {
      return 'DNF';
    }

    const totalSeconds = timeMs / 1000;
    const seconds = Math.floor(totalSeconds);
    const hundredths = Math.floor((totalSeconds - seconds) * 100);
    const timeString = `${seconds}.${hundredths.toString().padStart(2, '0')}s`;

    if (penaltyType === '+2') {
      return `${timeString} (+2)`;
    }

    return timeString;
  };

  /**
   * Formats date to readable format
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Formats time to readable format
   */
  const formatTimeOfDay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'medium',
                      color: solve.penalty_type === 'DNF' ? 'error.main' : 'inherit',
                    }}
                  >
                    {formatTime(solve.time_ms, solve.penalty_type)}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(solve.created_at)}</TableCell>
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
