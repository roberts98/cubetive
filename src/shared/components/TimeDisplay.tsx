import { Typography, TypographyProps } from '@mui/material';
import type { PenaltyType } from '../../types';
import { formatTime } from '../utils/formatters';

interface TimeDisplayProps {
  /**
   * Time in milliseconds
   */
  timeMs: number | null;

  /**
   * Optional penalty type (null, '+2', 'DNF')
   */
  penaltyType?: PenaltyType;

  /**
   * Typography variant
   * @default "h5"
   */
  variant?: TypographyProps['variant'];

  /**
   * Custom color (overrides default penalty colors)
   */
  color?: string;

  /**
   * Apply error color for DNF times
   * @default true
   */
  highlightDNF?: boolean;

  /**
   * Additional sx props
   */
  sx?: TypographyProps['sx'];
}

/**
 * TimeDisplay Component
 *
 * Reusable component for displaying formatted solve times with penalties.
 * Automatically applies error color for DNF times.
 *
 * @example
 * // Basic usage
 * <TimeDisplay timeMs={12345} />
 *
 * @example
 * // With penalty
 * <TimeDisplay timeMs={12345} penaltyType="+2" />
 *
 * @example
 * // DNF with custom styling
 * <TimeDisplay timeMs={12345} penaltyType="DNF" variant="h4" />
 *
 * @example
 * // Large display format
 * <TimeDisplay timeMs={12345} variant="h3" sx={{ fontWeight: 'bold' }} />
 */
function TimeDisplay({
  timeMs,
  penaltyType,
  variant = 'h5',
  color,
  highlightDNF = true,
  sx,
}: TimeDisplayProps) {
  const formattedTime = formatTime(timeMs, penaltyType);

  const displayColor = color || (highlightDNF && penaltyType === 'DNF' ? 'error.main' : 'inherit');

  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: 'medium',
        color: displayColor,
        ...sx,
      }}
    >
      {formattedTime}
    </Typography>
  );
}

export default TimeDisplay;
