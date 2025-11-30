import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { LoginFormData } from '../schemas/auth.schemas';

function LoginPage() {
  const handleSubmit = async (data: LoginFormData) => {
    // This will be implemented with Supabase in the next step
    console.log('Login attempt:', data);
    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
