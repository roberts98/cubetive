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
import { updatePasswordSchema, type UpdatePasswordFormData } from '../schemas/auth.schemas';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface UpdatePasswordFormProps {
  onSubmit: (data: UpdatePasswordFormData) => Promise<void>;
}

function UpdatePasswordForm({ onSubmit }: UpdatePasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onFormSubmit = async (data: UpdatePasswordFormData) => {
    setSubmitError(null);

    try {
      await onSubmit(data);
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

      <TextField
        {...register('password')}
        fullWidth
        id="password"
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        autoFocus
        required
        sx={{ mb: 1 }}
        aria-label="New password"
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
        label="Confirm New Password"
        type={showConfirmPassword ? 'text' : 'password'}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isSubmitting}
        autoComplete="new-password"
        required
        sx={{ mb: 3 }}
        aria-label="Confirm new password"
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
            Updating password...
          </>
        ) : (
          'Update Password'
        )}
      </Button>
    </Box>
  );
}

export default UpdatePasswordForm;
