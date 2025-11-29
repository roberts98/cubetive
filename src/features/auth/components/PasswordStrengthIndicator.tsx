import { Box, LinearProgress, Typography } from '@mui/material';
import { calculatePasswordStrength } from '../../../utils/validators/password';
import type { PasswordStrengthResult } from '../types/auth.types';

interface PasswordStrengthIndicatorProps {
  password: string;
  onStrengthChange?: (result: PasswordStrengthResult) => void;
}

function PasswordStrengthIndicator({
  password,
  onStrengthChange,
}: PasswordStrengthIndicatorProps) {
  const result = calculatePasswordStrength(password);

  // Call callback when strength changes
  if (onStrengthChange) {
    onStrengthChange(result);
  }

  const getColor = () => {
    switch (result.strength) {
      case 'weak':
        return 'error';
      case 'medium':
        return 'warning';
      case 'strong':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getLabel = () => {
    switch (result.strength) {
      case 'weak':
        return 'Weak password';
      case 'medium':
        return 'Medium password';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={result.score}
        color={getColor()}
        sx={{ height: 6, borderRadius: 3 }}
        aria-valuenow={result.score}
        aria-valuetext={getLabel()}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
        <Typography variant="caption" color={`${getColor()}.main`}>
          {getLabel()}
        </Typography>
        {result.feedback.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {result.feedback.join(', ')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default PasswordStrengthIndicator;
