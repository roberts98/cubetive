import { Box, Paper, Typography, Button } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import type { PublicProfileDTO } from '../../../types';
import { showSuccess } from '../../../shared/utils/notifications';

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
  /**
   * Formats time in milliseconds to user-friendly format (seconds.hundredths)
   */
  const formatTime = (timeMs: number | null): string => {
    if (timeMs === null) return 'N/A';

    const totalSeconds = timeMs / 1000;
    const seconds = Math.floor(totalSeconds);
    const hundredths = Math.floor((totalSeconds - seconds) * 100);

    return `${seconds}.${hundredths.toString().padStart(2, '0')}s`;
  };

  /**
   * Formats date to readable format
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Copies profile URL to clipboard
   */
  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile.username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      showSuccess('Profile link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mt: 3,
        }}
      >
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Personal Best Single
          </Typography>
          <Typography variant="h5">{formatTime(profile.pb_single)}</Typography>
        </Paper>

        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Best Average of 5
          </Typography>
          <Typography variant="h5">{formatTime(profile.pb_ao5)}</Typography>
        </Paper>

        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Best Average of 12
          </Typography>
          <Typography variant="h5">{formatTime(profile.pb_ao12)}</Typography>
        </Paper>

        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Total Solves
          </Typography>
          <Typography variant="h5">{profile.total_solves}</Typography>
        </Paper>
      </Box>
    </Paper>
  );
}
