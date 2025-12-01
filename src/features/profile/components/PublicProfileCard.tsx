import { Box, Paper, Typography, Button } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import type { PublicProfileDTO } from '../../../types';
import { StatisticsGrid } from '../../../shared/components';
import { formatDate, getProfileUrl } from '../../../shared/utils/formatters';
import { useClipboard } from '../../../shared/hooks/useClipboard';

interface PublicProfileCardProps {
  profile: PublicProfileDTO;
}

/**
 * PublicProfileCard
 *
 * Displays public profile information including username, join date,
 * and personal bests.
 */
export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const { copy } = useClipboard({
    successMessage: 'Profile link copied to clipboard',
    errorMessage: 'Failed to copy link',
  });

  const handleCopyLink = () => {
    const profileUrl = getProfileUrl(profile.username);
    copy(profileUrl);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {profile.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member since {formatDate(profile.created_at)}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<CopyIcon />} onClick={handleCopyLink} size="small">
          Copy Link
        </Button>
      </Box>

      {/* Statistics Grid */}
      <StatisticsGrid
        statistics={[
          { label: 'Personal Best Single', timeMs: profile.pb_single },
          { label: 'Best Average of 5', timeMs: profile.pb_ao5 },
          { label: 'Best Average of 12', timeMs: profile.pb_ao12 },
          { label: 'Total Solves', timeMs: profile.total_solves, isCount: true },
        ]}
      />
    </Paper>
  );
}
