import { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { supabase } from '../../../db/supabase';

type VerificationState = 'loading' | 'success' | 'error';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase automatically handles the verification token from the URL hash
        // When the user clicks the verification link, Supabase processes it and creates a session
        // We just need to check if we now have a session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setVerificationState('error');
          return;
        }

        if (session) {
          // Email verified successfully - session exists
          setVerificationState('success');

          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          // No session found - verification might have failed
          setVerificationState('error');
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        setVerificationState('error');
      }
    };

    verifyEmail();
  }, [navigate]);

  const handleResendVerification = async () => {
    // For resending, user needs to provide their email
    // For MVP, just redirect to login where they can request resend
    navigate('/login');
  };

  if (verificationState === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={64} sx={{ mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Verifying your email...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we confirm your email address.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (verificationState === 'success') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Email Verified!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            Your email address has been successfully verified. You can now log in to your account.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to login page in a few seconds...
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Verification Failed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
          This verification link is invalid or has expired. Verification links are only valid for 24
          hours.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          If you need a new verification email, please request one below.
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
          <Button variant="contained" onClick={handleResendVerification}>
            Resend Verification Email
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default VerifyEmailPage;
