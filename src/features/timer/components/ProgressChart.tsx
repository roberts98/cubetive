import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import type { SolveDTO } from '../types/timer.types';
import { getEffectiveTime, calculateAo12 } from '../utils/statistics';

interface ProgressChartProps {
  /**
   * Array of solve records to display
   */
  solves: SolveDTO[];

  /**
   * Whether to show the moving average line
   * @default true
   */
  showMovingAverage?: boolean;
}

/**
 * Chart data point for Recharts
 */
interface ChartDataPoint {
  date: string;
  time: number | null;
  ao12: number | null;
  timestamp: number;
}

/**
 * Format time in milliseconds to seconds with 2 decimal places
 */
function formatTimeForChart(timeMs: number | null): string {
  if (timeMs === null) return 'DNF';
  return (timeMs / 1000).toFixed(2);
}

/**
 * Calculate moving Ao12 for each solve
 */
function calculateMovingAverages(solves: SolveDTO[]): (number | null)[] {
  const movingAverages: (number | null)[] = [];

  for (let i = 0; i < solves.length; i++) {
    // Get window of up to 12 solves ending at current index
    const windowStart = Math.max(0, i - 11);
    const window = solves.slice(windowStart, i + 1);

    // Calculate Ao12 if we have at least 12 solves
    const ao12 = window.length >= 12 ? calculateAo12(window) : null;
    movingAverages.push(ao12);
  }

  return movingAverages;
}

/**
 * ProgressChart Component
 *
 * Displays a line chart showing solve times over time with optional Ao12 moving average.
 * Includes interactive tooltips and responsive design.
 *
 * @example
 * <ProgressChart solves={userSolves} showMovingAverage={true} />
 */
function ProgressChart({ solves, showMovingAverage = true }: ProgressChartProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (solves.length === 0) return [];

    // Reverse solves to show chronological order (oldest to newest)
    const chronologicalSolves = [...solves].reverse();

    // Calculate moving averages
    const movingAverages = showMovingAverage ? calculateMovingAverages(chronologicalSolves) : [];

    // Transform to chart data format
    return chronologicalSolves.map((solve, index) => {
      const effectiveTime = getEffectiveTime(solve);
      const time = effectiveTime === 'DNF' ? null : effectiveTime;

      return {
        date: format(new Date(solve.created_at), 'MMM dd HH:mm'),
        time,
        ao12: showMovingAverage ? movingAverages[index] : null,
        timestamp: new Date(solve.created_at).getTime(),
      } as ChartDataPoint;
    });
  }, [solves, showMovingAverage]);

  if (solves.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No solve data to display. Start timing to see your progress!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            label={{
              value: 'Time (seconds)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: theme.palette.text.secondary },
            }}
            tickFormatter={(value) => (value / 1000).toFixed(1)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
            labelStyle={{ color: theme.palette.text.primary }}
            formatter={(
              value: number | string | readonly (string | number)[] | null,
              name: string
            ) => {
              if (value === null || typeof value === 'string' || Array.isArray(value))
                return ['DNF', name];
              return [formatTimeForChart(value as number) + 's', name];
            }}
          />
          <Legend wrapperStyle={{ color: theme.palette.text.primary }} iconType="line" />
          <Line
            type="monotone"
            dataKey="time"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 3, fill: theme.palette.primary.main }}
            activeDot={{ r: 5 }}
            name="Solve Time"
            connectNulls={false}
          />
          {showMovingAverage && (
            <Line
              type="monotone"
              dataKey="ao12"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={false}
              name="Ao12 (Moving)"
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default ProgressChart;
