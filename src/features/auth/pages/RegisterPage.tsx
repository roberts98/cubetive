import { Box, Typography } from '@mui/material';
import RegisterForm from '../components/RegisterForm';
import AuthPageLayout from '../components/AuthPageLayout';
import StyledLink from '../components/StyledLink';
import type { RegisterFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function RegisterPage() {
  const signUp = useAuthStore((state) => state.signUp);

  // Redirect to dashboard if already logged in (don't preserve return URL)
  useAuthRedirect('/dashboard', false);

  const handleSubmit = async (data: RegisterFormData) => {
    await signUp(data.email, data.password, data.username);
    // Success message is shown by the form
    // User can manually navigate to login after seeing the success message
  };

  return (
    <AuthPageLayout title="Create your account">
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
