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
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/authStore';

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
              helperText="3-30 characters, letters, numbers, _ and - only"
              sx={{ mb: 3 }}
              disabled
              placeholder="Will be loaded from profile"
            />
            <FormControlLabel
              control={<Switch />}
              label="Make profile public"
              sx={{ mb: 2 }}
              disabled
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Public profiles can be shared via a unique URL
            </Typography>
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
            <Typography variant="body1" color="text.secondary">
              Your solving statistics will appear here once implemented.
            </Typography>
            <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="body2">
                • Personal Best Single
                <br />
                • Best Average of 5 (Ao5)
                <br />
                • Best Average of 12 (Ao12)
                <br />• Total Solves
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProfilePage;
