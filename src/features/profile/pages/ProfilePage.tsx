import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Switch,
  Link as MuiLink,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/authStore';
import { useCurrentProfile } from '../hooks/useProfile';
import { useUpdateProfileVisibility } from '../hooks/useUpdateProfileVisibility';
import { showSuccess, showError } from '../../../shared/utils/notifications';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * ProfilePage
 *
 * User profile settings and management.
 * Includes general settings, account settings, and statistics.
 */
function ProfilePage() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const [currentTab, setCurrentTab] = useState(0);

  // Load profile data
  const { data: profile, loading: profileLoading, error: profileError } = useCurrentProfile();

  // Profile visibility update hook
  const {
    loading: updateLoading,
    error: updateError,
    execute: updateVisibility,
  } = useUpdateProfileVisibility();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

  const handleCopyProfileLink = async () => {
    if (!profile) return;

    const profileUrl = `${window.location.origin}/profile/${profile.username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      showSuccess('Profile link copied to clipboard');
    } catch (error) {
      showError('Failed to copy link');
      console.error('Failed to copy profile link:', error);
    }
  };

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

  // Loading state
  if (profileLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cubetive
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">
            {profileError?.message || 'Failed to load profile. Please try again.'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cubetive
          </Typography>
          <MuiLink
            component={RouterLink}
            to="/dashboard"
            color="inherit"
            underline="none"
            sx={{ mr: 2 }}
          >
            Dashboard
          </MuiLink>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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
                value={`${window.location.origin}/profile/${profile.username}`}
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
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Personal Best Single
                </Typography>
                <Typography variant="h5">{formatTime(profile.pb_single)}</Typography>
                {profile.pb_single_date && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(profile.pb_single_date).toLocaleDateString()}
                  </Typography>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Best Average of 5 (Ao5)
                </Typography>
                <Typography variant="h5">{formatTime(profile.pb_ao5)}</Typography>
                {profile.pb_ao5_date && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(profile.pb_ao5_date).toLocaleDateString()}
                  </Typography>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Best Average of 12 (Ao12)
                </Typography>
                <Typography variant="h5">{formatTime(profile.pb_ao12)}</Typography>
                {profile.pb_ao12_date && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(profile.pb_ao12_date).toLocaleDateString()}
                  </Typography>
                )}
              </Paper>

              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Solves
                </Typography>
                <Typography variant="h5">{profile.total_solves}</Typography>
              </Paper>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProfilePage;
