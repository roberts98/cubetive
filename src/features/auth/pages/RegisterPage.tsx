import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { RegisterFormData } from '../schemas/auth.schemas';

function RegisterPage() {
  const handleSubmit = async (data: RegisterFormData) => {
    // This will be implemented with Supabase in the next step
    console.log('Registration attempt:', data);
    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
