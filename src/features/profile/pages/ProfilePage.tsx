import {
  Typography,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../auth/stores/authStore';
import { useCurrentProfile } from '../hooks/useProfile';
import { useUpdateProfileVisibility } from '../hooks/useUpdateProfileVisibility';
import { showSuccess, showError } from '../../../shared/utils/notifications';
import { PageLayout, StatisticsGrid, TabPanel } from '../../../shared/components';
import { getProfileUrl } from '../../../shared/utils/formatters';
import { useClipboard } from '../../../shared/hooks/useClipboard';
import { useDataRefresh } from '../../../shared/hooks/useDataRefresh';

/**
 * ProfilePage
 *
 * User profile settings and management.
 * Includes general settings, account settings, and statistics.
 */
function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [currentTab, setCurrentTab] = useState(0);

  // Load profile data
  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
    execute: refetchProfile,
  } = useCurrentProfile();

  // Subscribe to profile data changes - automatically refetch when profile updates
  useDataRefresh('profile', refetchProfile);

  // Profile visibility update hook
  const {
    loading: updateLoading,
    error: updateError,
    execute: updateVisibility,
  } = useUpdateProfileVisibility();

  // Clipboard hook
  const { copy } = useClipboard({
    successMessage: 'Profile link copied to clipboard',
    errorMessage: 'Failed to copy link',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleVisibilityToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isPublic = event.target.checked;

    try {
      await updateVisibility(isPublic);
      showSuccess(`Profile is now ${isPublic ? 'public' : 'private'}`);
    } catch (error) {
      showError('Failed to update profile visibility');
      console.error('Failed to update visibility:', error);
    }
  };

  const handleCopyProfileLink = () => {
    if (!profile) return;
    const profileUrl = getProfileUrl(profile.username);
    copy(profileUrl);
  };

  // Return early if no profile data yet
  if (!profile && !profileLoading && !profileError) {
    return null;
  }

  return (
    <PageLayout
      loading={profileLoading}
      error={profileError}
      errorMessage="Failed to load profile. Please try again."
    >
      {profile && (
        <Paper elevation={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Manage your account settings and preferences
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="profile tabs">
              <Tab label="General" />
              <Tab label="Account" />
              <Tab label="Statistics" />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={profile.username}
              helperText="Username cannot be changed"
              sx={{ mb: 3 }}
              disabled
            />
            <FormControlLabel
              control={
                <Switch
                  checked={profile.profile_visibility ?? false}
                  onChange={handleVisibilityToggle}
                  disabled={updateLoading}
                />
              }
              label="Make profile public"
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Public profiles can be shared via a unique URL
            </Typography>

            {profile.profile_visibility && (
              <TextField
                fullWidth
                label="Public Profile Link"
                value={getProfileUrl(profile.username)}
                helperText="Share this link to let others view your public profile"
                sx={{ mb: 2 }}
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy link">
                        <IconButton onClick={handleCopyProfileLink} edge="end">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {updateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {updateError.message}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              helperText="Email cannot be changed"
              sx={{ mb: 3 }}
              disabled
            />
            <Button variant="outlined" sx={{ mb: 2 }} disabled>
              Change Password
            </Button>
            <Box sx={{ mt: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Danger Zone
              </Typography>
              <Button variant="outlined" color="error" disabled>
                Delete Account
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <StatisticsGrid
                statistics={[
                  {
                    label: 'Personal Best Single',
                    timeMs: profile.pb_single,
                    date: profile.pb_single_date,
                  },
                  {
                    label: 'Best Average of 5 (Ao5)',
                    timeMs: profile.pb_ao5,
                    date: profile.pb_ao5_date,
                  },
                  {
                    label: 'Best Average of 12 (Ao12)',
                    timeMs: profile.pb_ao12,
                    date: profile.pb_ao12_date,
                  },
                  {
                    label: 'Total Solves',
                    timeMs: profile.total_solves,
                    date: null,
                    isCount: true,
                  },
                ]}
                showDates
                columns={{ xs: '1fr', sm: '1fr', md: 'repeat(2, 1fr)' }}
              />
            </Box>
          </TabPanel>
        </Paper>
      )}
    </PageLayout>
  );
}

export default ProfilePage;
