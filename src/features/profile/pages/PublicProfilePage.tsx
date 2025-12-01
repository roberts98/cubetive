import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { PublicProfileCard } from '../components/PublicProfileCard';
import { RecentSolvesDisplay } from '../components/RecentSolvesDisplay';
import { useAuthStore } from '../../auth/stores/authStore';

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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const { data: profile, loading, error } = usePublicProfile(username || '');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cubetive
            </Typography>
            {user ? (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/dashboard"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Dashboard
                </MuiLink>
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
              </>
            ) : (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Login
                </MuiLink>
                <Button component={RouterLink} to="/register" color="inherit">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cubetive
            </Typography>
            {user ? (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/dashboard"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Dashboard
                </MuiLink>
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
              </>
            ) : (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Login
                </MuiLink>
                <Button component={RouterLink} to="/register" color="inherit">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">{error.message || 'Failed to load profile'}</Alert>
        </Container>
      </Box>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cubetive
            </Typography>
            {user ? (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/dashboard"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Dashboard
                </MuiLink>
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
              </>
            ) : (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Login
                </MuiLink>
                <Button component={RouterLink} to="/register" color="inherit">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
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
        </Container>
      </Box>
    );
  }

  // Private profile
  if (!profile.profile_visibility) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cubetive
            </Typography>
            {user ? (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/dashboard"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Dashboard
                </MuiLink>
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
              </>
            ) : (
              <>
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  underline="none"
                  sx={{ mr: 2 }}
                >
                  Login
                </MuiLink>
                <Button component={RouterLink} to="/register" color="inherit">
                  Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
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
        </Container>
      </Box>
    );
  }

  // Public profile with data
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cubetive
          </Typography>
          {user ? (
            <>
              <MuiLink
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                underline="none"
                sx={{ mr: 2 }}
              >
                Dashboard
              </MuiLink>
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
            </>
          ) : (
            <>
              <MuiLink
                component={RouterLink}
                to="/login"
                color="inherit"
                underline="none"
                sx={{ mr: 2 }}
              >
                Login
              </MuiLink>
              <Button component={RouterLink} to="/register" color="inherit">
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <PublicProfileCard profile={profile} />
        <RecentSolvesDisplay solves={profile.recent_solves} />
      </Container>
    </Box>
  );
}

export default PublicProfilePage;
