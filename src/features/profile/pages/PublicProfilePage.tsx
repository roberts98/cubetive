import { Typography, Paper, Box } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { PublicProfileCard } from '../components/PublicProfileCard';
import { RecentSolvesDisplay } from '../components/RecentSolvesDisplay';
import { PageLayout } from '../../../shared/components';
import { Button } from '@mui/material';

/**
 * PublicProfilePage
 *
 * Public-facing profile page that displays a user's profile information
 * and recent solves. Accessible without authentication via /profile/:username.
 *
 * Handles:
 * - Loading states
 * - Profile not found
 * - Private profiles (shows privacy message)
 * - Public profiles (shows full data)
 */
function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, loading, error } = usePublicProfile(username || '');

  // Profile not found (only show if not loading and no error)
  if (!loading && !error && !profile) {
    return (
      <PageLayout>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            The profile &quot;{username}&quot; does not exist.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
            Go to Home
          </Button>
        </Paper>
      </PageLayout>
    );
  }

  // Private profile
  if (profile && !profile.profile_visibility) {
    return (
      <PageLayout>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Private Profile
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            This profile is set to private and cannot be viewed publicly.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
            Go to Home
          </Button>
        </Paper>
      </PageLayout>
    );
  }

  // Public profile with data
  return (
    <PageLayout loading={loading} error={error} errorMessage="Failed to load profile">
      {profile && (
        <Box>
          <PublicProfileCard profile={profile} />
          <RecentSolvesDisplay solves={profile.recent_solves} />
        </Box>
      )}
    </PageLayout>
  );
}

export default PublicProfilePage;
