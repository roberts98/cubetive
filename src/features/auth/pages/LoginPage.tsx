import { Box, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';
import AuthPageLayout from '../components/AuthPageLayout';
import StyledLink from '../components/StyledLink';
import type { LoginFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);

  // Redirect to dashboard if already logged in (preserve return URL)
  useAuthRedirect('/dashboard', true);

  const handleSubmit = async (data: LoginFormData) => {
    await signIn(data.email, data.password);
    // Navigation will happen via the useAuthRedirect hook when user state updates
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
