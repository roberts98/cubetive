import { AppBar, Toolbar, Typography, Button, Link as MuiLink, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/authStore';

interface NavLink {
  label: string;
  to: string;
}

interface AppNavigationProps {
  /**
   * Application title displayed on the left
   * @default "Cubetive"
   */
  title?: string;

  /**
   * Additional navigation links for authenticated users
   * @default []
   */
  authenticatedLinks?: NavLink[];

  /**
   * Additional navigation links for unauthenticated users
   * @default []
   */
  unauthenticatedLinks?: NavLink[];

  /**
   * Hide the default navigation links (Dashboard, Profile for auth users)
   * @default false
   */
  hideDefaultLinks?: boolean;
}

/**
 * AppNavigation Component
 *
 * Reusable navigation bar with authentication state handling.
 * Automatically displays appropriate links based on user authentication status.
 *
 * @example
 * // Basic usage (default dashboard/profile links)
 * <AppNavigation />
 *
 * @example
 * // Custom links for authenticated users
 * <AppNavigation
 *   authenticatedLinks={[
 *     { label: 'Dashboard', to: '/dashboard' },
 *     { label: 'Profile', to: '/profile' }
 *   ]}
 * />
 *
 * @example
 * // Hide default links (for landing pages)
 * <AppNavigation hideDefaultLinks />
 */
function AppNavigation({
  title = 'Cubetive',
  authenticatedLinks = [],
  unauthenticatedLinks = [],
  hideDefaultLinks = false,
}: AppNavigationProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Default links for authenticated users
  const defaultAuthLinks: NavLink[] = hideDefaultLinks
    ? []
    : [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'History', to: '/history' },
        { label: 'Profile', to: '/profile' },
      ];

  // Default links for unauthenticated users
  const defaultUnauthLinks: NavLink[] = hideDefaultLinks ? [] : [{ label: 'Login', to: '/login' }];

  // Merge default links with custom links
  const authLinks = [...defaultAuthLinks, ...authenticatedLinks];
  const unauthLinks = [...defaultUnauthLinks, ...unauthenticatedLinks];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {authLinks.map((link) => (
              <MuiLink
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                underline="none"
              >
                {link.label}
              </MuiLink>
            ))}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {unauthLinks.map((link) => (
              <MuiLink
                key={link.to}
                component={RouterLink}
                to={link.to}
                color="inherit"
                underline="none"
              >
                {link.label}
              </MuiLink>
            ))}
            <Button component={RouterLink} to="/register" color="inherit">
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default AppNavigation;
