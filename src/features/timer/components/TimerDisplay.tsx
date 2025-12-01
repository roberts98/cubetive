/**
 * TimerDisplay Component
 *
 * Displays the timer in large format with color-coded states.
 * Follows WCA standards for visual feedback during timing.
 *
 * Color States:
 * - Idle: Default text color
 * - Ready: Green (ready to start)
 * - Running: Default text color (time counting)
 * - Stopped: Default text color (showing final time)
 */

import { Box, Typography } from '@mui/material';
import { useTimer } from '../hooks/useTimer';

/**
 * Component for displaying the timer
 *
 * Shows elapsed time in large, easily readable format.
 * Color changes to green when ready to start (WCA standard).
 *
 * @example
 * <TimerDisplay />
 */
function TimerDisplay() {
  const { state, formattedTime, lastSolveTime } = useTimer();

  /**
   * Determines the color based on timer state
   */
  const getColor = () => {
    switch (state) {
      case 'ready':
        return 'success.main'; // Green when ready to start
      case 'idle':
      case 'running':
      case 'stopped':
      default:
        return 'text.primary';
    }
  };

  /**
   * Determines what time to display
   */
  const getDisplayTime = () => {
    if (state === 'stopped' && lastSolveTime !== null) {
      const totalSeconds = lastSolveTime / 1000;
      const seconds = Math.floor(totalSeconds);
      const hundredths = Math.floor((totalSeconds - seconds) * 100);
      return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
    }
    if (state === 'running') {
      return formattedTime;
    }
    return '0.00';
  };

  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
          fontWeight: 300,
          fontFamily: 'monospace',
          color: getColor(),
          letterSpacing: '0.05em',
          transition: 'color 0.2s ease',
        }}
      >
        {getDisplayTime()}
      </Typography>

      {/* State indicator for debugging/feedback */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {state === 'idle' && 'Press spacebar to start'}
        {state === 'ready' && 'Release to start'}
        {state === 'running' && 'Solving...'}
        {state === 'stopped' && 'Select penalty to save your solve'}
      </Typography>
    </Box>
  );
}

export default TimerDisplay;
