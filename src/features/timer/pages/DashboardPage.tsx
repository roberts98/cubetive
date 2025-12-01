import { useState, useMemo } from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import { PageLayout } from '../../../shared/components';
import ScrambleDisplay from '../components/ScrambleDisplay';
import TimerDisplay from '../components/TimerDisplay';
import ProgressChart from '../components/ProgressChart';
import DateRangeSelector, { type DateRange } from '../components/DateRangeSelector';
import StatsOverview from '../components/StatsOverview';
import { useFilteredSolves } from '../hooks/useFilteredSolves';
import { calculateAo5, calculateAo12, findPersonalBest } from '../utils/statistics';

/**
 * DashboardPage
 *
 * Main authenticated landing page with timer interface and analytics.
 * Provides WCA-standard timing controls and visual progress tracking.
 */
function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Fetch filtered solves based on date range
  const { solves, loading, error } = useFilteredSolves(dateRange);

  // Calculate current statistics
  const stats = useMemo(() => {
    if (!solves || solves.length === 0) {
      return {
        pbSingle: null,
        currentAo5: null,
        currentAo12: null,
        totalSolves: 0,
      };
    }

    const pb = findPersonalBest(solves);
    const ao5 = calculateAo5(solves);
    const ao12 = calculateAo12(solves);

    return {
      pbSingle: pb?.time_ms || null,
      currentAo5: ao5,
      currentAo12: ao12,
      totalSolves: solves.length,
    };
  }, [solves]);

  return (
    <PageLayout maxWidth="lg" fullHeight>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Timer Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '50vh' }}>
          {/* Scramble Display */}
          <ScrambleDisplay />

          {/* Timer Display */}
          <TimerDisplay />

          {/* Instructions */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>How to use:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Press and hold the spacebar for 0.5 seconds (timer will turn green)
              <br />
              2. Release the spacebar to start timing
              <br />
              3. Press the spacebar again to stop the timer
              <br />
              4. Your time will be automatically saved
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Analytics Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Performance Analytics
          </Typography>

          {/* Statistics Overview Cards */}
          <StatsOverview
            pbSingle={stats.pbSingle}
            currentAo5={stats.currentAo5}
            currentAo12={stats.currentAo12}
            totalSolves={stats.totalSolves}
          />

          {/* Date Range Selector */}
          <DateRangeSelector value={dateRange} onChange={setDateRange} />

          {/* Progress Chart */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Solve Times & Ao12 Trend
            </Typography>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load solve data: {error.message}
              </Alert>
            )}
            {!loading && !error && <ProgressChart solves={solves} showMovingAverage={true} />}
          </Paper>
        </Box>
      </Box>
    </PageLayout>
  );
}

export default DashboardPage;
