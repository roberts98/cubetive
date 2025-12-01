import { Typography, Box } from '@mui/material';
import { PageLayout } from '../../../shared/components';
import ScrambleDisplay from '../components/ScrambleDisplay';
import TimerDisplay from '../components/TimerDisplay';

/**
 * DashboardPage
 *
 * Main authenticated landing page with timer interface.
 * Provides WCA-standard timing controls for speedcubing practice.
 */
function DashboardPage() {
  return (
    <PageLayout maxWidth="md" fullHeight>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
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
    </PageLayout>
  );
}

export default DashboardPage;
