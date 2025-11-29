import { useState } from 'react';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdatePasswordForm from '../components/UpdatePasswordForm';
import type { UpdatePasswordFormData } from '../schemas/auth.schemas';

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: UpdatePasswordFormData) => {
    // This will be implemented with Supabase in the next step
    console.log('Update password:', data);
    // Placeholder - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSuccess(true);

    // Auto-redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
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
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Set New Password
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Alert severity="info">
            Enter your new password below. Make sure it's at least 8 characters long.
          </Alert>
        </Box>

        <UpdatePasswordForm onSubmit={handleSubmit} />
      </Paper>
    </Container>
  );
}

export default UpdatePasswordPage;
