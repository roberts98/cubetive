import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginSchema } from '../schemas/auth.schemas';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  defaultEmail?: string;
}

function LoginForm({ onSubmit, defaultEmail = '' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
      rememberMe: false,
    },
  });

  const onFormSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
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
        {...register('password')}
        fullWidth
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isSubmitting}
        autoComplete="current-password"
        required
        sx={{ mb: 2 }}
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

      <FormControlLabel
        control={
          <Checkbox
            {...register('rememberMe')}
            id="rememberMe"
            disabled={isSubmitting}
          />
        }
        label="Remember me for 30 days"
        sx={{ mb: 2 }}
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
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </Box>
  );
}

export default LoginForm;
