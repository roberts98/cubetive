/**
 * ScrambleDisplay Component
 *
 * Displays the current scramble notation for the user to follow.
 * Shows WCA-standard notation in a clear, readable format.
 */

import { Box, Typography, Paper } from '@mui/material';
import { useScramble } from '../hooks/useScramble';

/**
 * Component for displaying the current scramble
 *
 * Shows the scramble in large, monospace font for easy reading.
 * The scramble notation follows WCA standards (e.g., "R U R' U' F").
 *
 * @example
 * <ScrambleDisplay />
 */
function ScrambleDisplay() {
  const { currentScramble } = useScramble();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        textAlign: 'center',
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Scramble
      </Typography>
      <Box
        sx={{
          fontFamily: 'monospace',
          fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          fontWeight: 500,
          letterSpacing: '0.05em',
          lineHeight: 1.6,
          color: 'text.primary',
          minHeight: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {currentScramble || 'Generating scramble...'}
      </Box>
    </Paper>
  );
}

export default ScrambleDisplay;
