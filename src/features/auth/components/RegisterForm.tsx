import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onFormSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await onSubmit(data);
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          {submitError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} role="alert">
          {successMessage}
        </Alert>
      )}

      <TextField
        {...register('email')}
        fullWidth
        id="email"
        label="Email"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isSubmitting}
        autoComplete="email"
        autoFocus
        required
        sx={{ mb: 2 }}
        aria-label="Email address"
      />

      <TextField
        {...register('username')}
        fullWidth
        id="username"
        label="Username"
        error={!!errors.username}
        helperText={errors.username?.message || '3-30 characters, letters, numbers, _ and - only'}
        disabled={isSubmitting}
        autoComplete="username"
        required
        sx={{ mb: 2 }}
        aria-label="Username"
      />

      <TextField
        {...register('password')}
        fullWidth
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        required
        sx={{ mb: 1 }}
        aria-label="Password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={isSubmitting}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <PasswordStrengthIndicator password={password} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
        Password must be at least 8 characters
      </Typography>

      <TextField
        {...register('confirmPassword')}
        fullWidth
        id="confirmPassword"
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        required
        sx={{ mb: 3 }}
        aria-label="Confirm password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isSubmitting}
        sx={{ mb: 2 }}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </Button>
    </Box>
  );
}

export default RegisterForm;
