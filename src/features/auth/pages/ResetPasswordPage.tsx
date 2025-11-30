import { Box, Typography } from '@mui/material';
import ResetPasswordRequestForm from '../components/ResetPasswordRequestForm';
import AuthPageLayout from '../components/AuthPageLayout';
import StyledLink from '../components/StyledLink';
import type { ResetPasswordRequestFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';

function ResetPasswordPage() {
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleSubmit = async (data: ResetPasswordRequestFormData) => {
    await resetPassword(data.email);
    // Success message is shown by the ResetPasswordRequestForm component
  };

  return (
    <AuthPageLayout title="Reset Your Password">
      <ResetPasswordRequestForm onSubmit={handleSubmit} />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Remember your password? <StyledLink to="/login">Back to Login</StyledLink>
        </Typography>
      </Box>
    </AuthPageLayout>
  );
}

export default ResetPasswordPage;
