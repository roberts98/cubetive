import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Alert, CircularProgress, Typography } from '@mui/material';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestFormData,
} from '../schemas/auth.schemas';

interface ResetPasswordRequestFormProps {
  onSubmit: (data: ResetPasswordRequestFormData) => Promise<void>;
}

function ResetPasswordRequestForm({ onSubmit }: ResetPasswordRequestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequestFormData>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  const onFormSubmit = async (data: ResetPasswordRequestFormData) => {
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await onSubmit(data);
      setSuccessMessage(
        'If an account exists with this email, you will receive password reset instructions. Please check your inbox.'
      );
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email address and we'll send you instructions to reset your password. The reset
        link will expire after 1 hour.
      </Typography>

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

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
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
            sx={{ mb: 3 }}
            aria-label="Email address"
          />
        )}
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
            Sending...
          </>
        ) : (
          'Send Reset Instructions'
        )}
      </Button>
    </Box>
  );
}

export default ResetPasswordRequestForm;
