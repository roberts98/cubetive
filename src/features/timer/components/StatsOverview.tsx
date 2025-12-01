import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Functions as AvgIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import { formatTime } from '../../../shared/utils/formatters';

interface StatsOverviewProps {
  /**
   * Personal best single time in milliseconds
   */
  pbSingle: number | null;

  /**
   * Current Average of 5 in milliseconds
   */
  currentAo5: number | null;

  /**
   * Current Average of 12 in milliseconds
   */
  currentAo12: number | null;

  /**
   * Total number of solves
   */
  totalSolves: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

/**
 * Individual stat card component
 */
function StatCard({ icon, label, value, color = 'primary.main' }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              color,
              display: 'flex',
              alignItems: 'center',
              mr: 1,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

/**
 * StatsOverview Component
 *
 * Displays key statistics in a grid of cards including PB single,
 * current Ao5, current Ao12, and total solve count.
 *
 * @example
 * <StatsOverview
 *   pbSingle={12345}
 *   currentAo5={13456}
 *   currentAo12={13789}
 *   totalSolves={150}
 * />
 */
function StatsOverview({ pbSingle, currentAo5, currentAo12, totalSolves }: StatsOverviewProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Statistics Overview
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<TrophyIcon />}
            label="Personal Best"
            value={formatTime(pbSingle)}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<SpeedIcon />}
            label="Current Ao5"
            value={formatTime(currentAo5)}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AvgIcon />}
            label="Current Ao12"
            value={formatTime(currentAo12)}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<ChartIcon />}
            label="Total Solves"
            value={totalSolves.toString()}
            color="success.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StatsOverview;
