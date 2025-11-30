import { useState } from 'react';
import { Typography, Box, Alert, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdatePasswordForm from '../components/UpdatePasswordForm';
import AuthPageLayout from '../components/AuthPageLayout';
import type { UpdatePasswordFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../stores/authStore';

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const updatePassword = useAuthStore((state) => state.updatePassword);

  const handleSubmit = async (data: UpdatePasswordFormData) => {
    await updatePassword(data.password);

    setIsSuccess(true);

    // Auto-redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Password Updated Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Your password has been changed. You will be redirected to the login page in a few
            seconds.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <AuthPageLayout title="Set New Password">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          Enter your new password below. Make sure it's at least 8 characters long.
        </Alert>
      </Box>

      <UpdatePasswordForm onSubmit={handleSubmit} />
    </AuthPageLayout>
  );
}

export default UpdatePasswordPage;
