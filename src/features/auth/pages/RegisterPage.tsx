import { Box, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import RegisterForm from '../components/RegisterForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { RegisterFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';

function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const user = useAuthStore((state) => state.user);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (data: RegisterFormData) => {
    await signUp(data.email, data.password, data.username);
    // Navigate to verification page, passing the email
    navigate('/verify-email', { state: { email: data.email } });
  };

  return (
    <AuthPageLayout title="Sign Up">
      <RegisterForm onSubmit={handleSubmit} />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Typography
            component={RouterLink}
            to="/login"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Login
          </Typography>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default RegisterPage;
