import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import AuthPageLayout from '../components/AuthPageLayout';
import StyledLink from '../components/StyledLink';
import type { RegisterFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);

  // Redirect to dashboard if already logged in (don't preserve return URL)
  useAuthRedirect('/dashboard', false);

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
          Already have an account? <StyledLink to="/login">Login</StyledLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default RegisterPage;
