import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ResetPasswordRequestForm from '../components/ResetPasswordRequestForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { ResetPasswordRequestFormData } from '../schemas/auth.schemas';

function ResetPasswordPage() {
  const handleSubmit = async (data: ResetPasswordRequestFormData) => {
    // This will be implemented with Supabase in the next step
    console.log('Reset password request:', data);
    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <AuthPageLayout title="Reset Your Password">
      <ResetPasswordRequestForm onSubmit={handleSubmit} />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Remember your password?{' '}
          <Typography
            component={RouterLink}
            to="/login"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Back to Login
          </Typography>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default ResetPasswordPage;
