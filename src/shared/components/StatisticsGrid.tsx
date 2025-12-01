import { Box, Paper, Typography } from '@mui/material';
import TimeDisplay from './TimeDisplay';

interface StatisticItem {
  label: string;
  timeMs: number | null;
  date?: string | null;
  /**
   * If true, displays as plain number instead of time format
   * @default false
   */
  isCount?: boolean;
}

interface StatisticsGridProps {
  /**
   * Array of statistics to display
   */
  statistics: StatisticItem[];

  /**
   * Show dates for each statistic
   * @default false
   */
  showDates?: boolean;

  /**
   * Grid columns configuration
   * @default { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }
   */
  columns?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
}

/**
 * StatisticsGrid Component
 *
 * Reusable grid layout for displaying personal best statistics.
 * Responsive design with customizable columns.
 * Supports both time-based statistics and plain count statistics.
 *
 * @example
 * // Basic usage
 * <StatisticsGrid
 *   statistics={[
 *     { label: 'Best Single', timeMs: 12345 },
 *     { label: 'Best Ao5', timeMs: 15000 },
 *     { label: 'Best Ao12', timeMs: 16000 },
 *     { label: 'Total Solves', timeMs: 100, isCount: true }
 *   ]}
 * />
 *
 * @example
 * // With dates
 * <StatisticsGrid
 *   statistics={[
 *     { label: 'Best Single', timeMs: 12345, date: '2025-01-15' }
 *   ]}
 *   showDates
 * />
 *
 * @example
 * // Custom grid layout
 * <StatisticsGrid
 *   statistics={stats}
 *   columns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
 * />
 */
function StatisticsGrid({
  statistics,
  showDates = false,
  columns = { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
}: StatisticsGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap: 2,
      }}
    >
      {statistics.map((stat) => (
        <Paper key={stat.label} elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {stat.label}
          </Typography>
          {stat.isCount ? (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'medium',
              }}
            >
              {stat.timeMs ?? '—'}
            </Typography>
          ) : (
            <TimeDisplay timeMs={stat.timeMs} />
          )}
          {showDates && stat.date && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {new Date(stat.date).toLocaleDateString()}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}

export default StatisticsGrid;
