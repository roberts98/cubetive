import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/authStore';
import ScrambleDisplay from '../components/ScrambleDisplay';
import TimerDisplay from '../components/TimerDisplay';

/**
 * DashboardPage
 *
 * Main authenticated landing page with timer interface.
 * Provides WCA-standard timing controls for speedcubing practice.
 */
function DashboardPage() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cubetive
          </Typography>
          <MuiLink
            component={RouterLink}
            to="/profile"
            color="inherit"
            underline="none"
            sx={{ mr: 2 }}
          >
            Profile
          </MuiLink>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content - Timer Interface */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Scramble Display */}
        <ScrambleDisplay />

        {/* Timer Display */}
        <TimerDisplay />

        {/* Instructions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>How to use:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Press and hold the spacebar for 0.5 seconds (timer will turn green)
            <br />
            2. Release the spacebar to start timing
            <br />
            3. Press the spacebar again to stop the timer
            <br />
            4. Your time will be automatically saved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default DashboardPage;
