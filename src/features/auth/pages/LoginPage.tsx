import { Box, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { LoginFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const user = useAuthStore((state) => state.user);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (data: LoginFormData) => {
    await signIn(data.email, data.password);
    // Navigation will happen via the useEffect above when user state updates
  };

  return (
    <AuthPageLayout title="Login">
      <LoginForm onSubmit={handleSubmit} />

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          <Typography
            component={RouterLink}
            to="/reset-password"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Forgot password?
          </Typography>
        </Typography>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Typography
            component={RouterLink}
            to="/register"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign Up
          </Typography>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default LoginPage;
