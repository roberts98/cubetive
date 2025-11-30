import { Container, Typography, AppBar, Toolbar, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/authStore';

/**
 * DashboardPage
 *
 * Main authenticated landing page.
 * Shows timer interface (to be implemented) and navigation.
 */
function DashboardPage() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cubetive
          </Typography>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            Profile
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Cubetive
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {user?.email}
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, mb: 3 }}>
            This is your dashboard. The timer interface will be implemented here.
          </Typography>
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Coming Soon:
            </Typography>
            <Typography variant="body1">
              • Rubik's Cube Timer
              <br />
              • Scramble Generator
              <br />
              • Session Statistics
              <br />• Solve History
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default DashboardPage;
