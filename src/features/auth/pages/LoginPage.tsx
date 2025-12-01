import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthPageLayout from '../components/AuthPageLayout';
import StyledLink from '../components/StyledLink';
import type { LoginFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if already logged in (preserve return URL)
  useAuthRedirect('/dashboard', true);

  const handleSubmit = async (data: LoginFormData) => {
    await signIn(data.email, data.password);

    // Explicitly navigate after successful login
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    const destination = from || '/dashboard';
    navigate(destination, { replace: true });
  };

  return (
    <AuthPageLayout title="Login">
      <LoginForm onSubmit={handleSubmit} />

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          <StyledLink to="/reset-password">Forgot password?</StyledLink>
        </Typography>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account? <StyledLink to="/register">Sign Up</StyledLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default LoginPage;
