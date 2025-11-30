import { useState } from 'react';
import { Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UpdatePasswordForm from '../components/UpdatePasswordForm';
import AuthPageLayout from '../components/AuthPageLayout';
import SuccessScreen from '../components/SuccessScreen';
import type { UpdatePasswordFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const updatePassword = useAuthStore((state) => state.updatePassword);

  const handleSubmit = async (data: UpdatePasswordFormData) => {
    await updatePassword(data.password);

    setIsSuccess(true);

    // Auto-redirect to login after configured timeout
    setTimeout(() => {
      navigate('/login');
    }, AUTH_CONSTANTS.SUCCESS_REDIRECT_TIMEOUT);
  };

  if (isSuccess) {
    return (
      <SuccessScreen
        title="Password Updated Successfully"
        message="Your password has been changed. You will be redirected to the login page in a few seconds."
      />
    );
  }

  return (
    <AuthPageLayout title="Set New Password">
      <Box sx={{ mb: AUTH_CONSTANTS.FORM_SECTION_MARGIN_BOTTOM }}>
        <Alert severity="info">
          Enter your new password below. Make sure it's at least{' '}
          {AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters long.
        </Alert>
      </Box>

      <UpdatePasswordForm onSubmit={handleSubmit} />
    </AuthPageLayout>
  );
}

export default UpdatePasswordPage;
