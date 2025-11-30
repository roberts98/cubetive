import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../../db/supabase';
import { AuthService } from '../services/authService';
import { verifyEmailCodeSchema, type VerifyEmailCodeFormData } from '../schemas/auth.schemas';

type VerificationState = 'loading' | 'success' | 'error' | 'idle';
type VerificationMode = 'auto' | 'manual';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [verificationMode, setVerificationMode] = useState<VerificationMode>('auto');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get email from location state (passed from registration)
  const userEmail = (location.state as { email?: string })?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailCodeFormData>({
    resolver: zodResolver(verifyEmailCodeSchema),
    defaultValues: {
      email: userEmail,
      code: '',
    },
  });

  // Auto-verify with token from URL (when user clicks link in email)
  useEffect(() => {
    const verifyEmailWithToken = async () => {
      try {
        // Supabase automatically handles the verification token from the URL hash
        // When the user clicks the verification link, Supabase processes it and creates a session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          setVerificationState('idle'); // Allow manual code entry
          setVerificationMode('manual');
          setErrorMessage(
            'Automatic verification failed. Please enter your verification code manually.'
          );
          return;
        }

        if (session) {
          // Email verified successfully - session exists
          setVerificationState('success');
          setVerificationMode('auto');

          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          // No session found - switch to manual code entry
          setVerificationState('idle');
          setVerificationMode('manual');
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        setVerificationState('idle');
        setVerificationMode('manual');
        setErrorMessage('Automatic verification failed. Please enter your verification code.');
      }
    };

    verifyEmailWithToken();
  }, [navigate]);

  const onSubmitCode = async (data: VerifyEmailCodeFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await AuthService.verifyEmailWithCode(data.email, data.code);
      setVerificationState('success');

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Code verification failed:', error);
      setVerificationState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Invalid or expired verification code'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      navigate('/register');
      return;
    }

    try {
      await AuthService.resendVerificationEmail(userEmail);
      setErrorMessage('');
      setVerificationState('idle');
    } catch (error) {
      console.error('Resend failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend verification');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: VerificationMode) => {
    setVerificationMode(newValue);
    setErrorMessage('');
  };

  // Loading state (only for auto verification)
  if (verificationState === 'loading' && verificationMode === 'auto') {
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

  // Success state
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

  // Idle or Error state - show manual verification form
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Verify Your Email
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          We sent a verification email to{' '}
          {userEmail ? <strong>{userEmail}</strong> : 'your email address'}
        </Typography>

        <Tabs
          value={verificationMode}
          onChange={handleTabChange}
          centered
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Automatic Verification" value="auto" />
          <Tab label="Enter Code" value="manual" />
        </Tabs>

        {verificationMode === 'auto' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Click the verification link in your email to complete the process.
            </Typography>

            {verificationState === 'error' && errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The verification link is valid for 24 hours.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button variant="contained" onClick={handleResendVerification}>
                Resend Email
              </Button>
              <Button variant="text" onClick={() => setVerificationMode('manual')}>
                Enter Code Instead
              </Button>
            </Box>
          </Box>
        )}

        {verificationMode === 'manual' && (
          <Box component="form" onSubmit={handleSubmit(onSubmitCode)}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter the 6-digit verification code from your email
            </Typography>

            {(verificationState === 'error' || errorMessage) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage || 'Invalid or expired verification code'}
              </Alert>
            )}

            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={!!userEmail}
            />

            <TextField
              {...register('code')}
              label="Verification Code"
              placeholder="000000"
              fullWidth
              margin="normal"
              error={!!errors.code}
              helperText={errors.code?.message}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric',
              }}
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Verify Email'}
            </Button>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button variant="text" onClick={handleResendVerification}>
                Resend Code
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default VerifyEmailPage;
