import { Box, Container, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import type { LoginFormData } from '../schemas/auth.schemas';

function LoginPage() {
  const handleSubmit = async (data: LoginFormData) => {
    // This will be implemented with Supabase in the next step
    console.log('Login attempt:', data);
    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>

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
      </Paper>
    </Container>
  );
}

export default LoginPage;
