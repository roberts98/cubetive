/**
 * PenaltyButtons Component
 *
 * Displays penalty selection buttons after a solve is completed.
 * Allows user to mark solve as DNF, +2, or OK (no penalty).
 *
 * Keyboard shortcuts:
 * - D or d: DNF
 * - 2: +2 penalty
 * - Enter or Space: OK (no penalty)
 */

import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTimer } from '../hooks/useTimer';
import type { PenaltyType } from '../types/timer.types';

/**
 * Component for penalty selection buttons
 *
 * Shows after timer stops, allowing user to select penalty before saving.
 *
 * @example
 * {state === 'stopped' && <PenaltyButtons />}
 */
function PenaltyButtons() {
  const { saveSolveWithPenalty } = useTimer();

  /**
   * Handles penalty selection and saves solve
   */
  const handlePenaltySelect = async (penaltyType: PenaltyType) => {
    await saveSolveWithPenalty(penaltyType);
  };

  /**
   * Keyboard shortcuts for penalty selection
   */
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // DNF - press 'D' or 'd'
      if (event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        handlePenaltySelect('DNF');
      }
      // +2 - press '2'
      else if (event.key === '2') {
        event.preventDefault();
        handlePenaltySelect('+2');
      }
      // OK (no penalty) - press Enter
      else if (event.key === 'Enter') {
        event.preventDefault();
        handlePenaltySelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mt: 4,
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Select Penalty
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => handlePenaltySelect('DNF')}
          sx={{
            minWidth: 120,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          DNF
          <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
            (D)
          </Typography>
        </Button>

        <Button
          variant="contained"
          color="warning"
          size="large"
          onClick={() => handlePenaltySelect('+2')}
          sx={{
            minWidth: 120,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          +2
          <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
            (2)
          </Typography>
        </Button>

        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => handlePenaltySelect(null)}
          sx={{
            minWidth: 120,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          OK
          <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
            (Enter)
          </Typography>
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Use keyboard shortcuts: D for DNF, 2 for +2, Enter for OK
      </Typography>
    </Box>
  );
}

export default PenaltyButtons;
