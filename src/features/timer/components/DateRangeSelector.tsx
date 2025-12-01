import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface DateRangeSelectorProps {
  /**
   * Currently selected date range
   */
  value: DateRange;

  /**
   * Callback when date range changes
   */
  onChange: (range: DateRange) => void;
}

/**
 * DateRangeSelector Component
 *
 * Toggle button group for selecting time range filter for solve history.
 * Provides options: Last 7 days, 30 days, 90 days, 1 year, or all time.
 *
 * @example
 * <DateRangeSelector value={dateRange} onChange={setDateRange} />
 */
function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: DateRange | null) => {
    // Prevent deselecting all options
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 3 }}>
      <DateRangeIcon sx={{ color: 'text.secondary' }} />
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="date range filter"
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
          },
        }}
      >
        <ToggleButton value="7d" aria-label="last 7 days">
          Last 7 Days
        </ToggleButton>
        <ToggleButton value="30d" aria-label="last 30 days">
          Last 30 Days
        </ToggleButton>
        <ToggleButton value="90d" aria-label="last 90 days">
          Last 90 Days
        </ToggleButton>
        <ToggleButton value="1y" aria-label="last year">
          Last Year
        </ToggleButton>
        <ToggleButton value="all" aria-label="all time">
          All Time
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default DateRangeSelector;
