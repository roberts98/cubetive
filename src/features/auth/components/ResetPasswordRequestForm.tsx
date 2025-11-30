import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequestFormData,
} from '../schemas/auth.schemas';
import { useFormSubmit } from '../hooks/useFormSubmit';
import FormTextField from './FormTextField';
import FormAlert from './FormAlert';
import SubmitButton from './SubmitButton';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface ResetPasswordRequestFormProps {
  onSubmit: (data: ResetPasswordRequestFormData) => Promise<void>;
}

function ResetPasswordRequestForm({ onSubmit }: ResetPasswordRequestFormProps) {
  const { submitError, successMessage, handleFormSubmit } = useFormSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequestFormData>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  const onFormSubmit = handleFormSubmit<ResetPasswordRequestFormData>(async (data) => {
    await onSubmit(data);
    reset();
    return 'If an account exists with this email, you will receive password reset instructions. Please check your inbox.';
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: AUTH_CONSTANTS.FORM_SECTION_MARGIN_BOTTOM }}
      >
        Enter your email address and we'll send you instructions to reset your password. The reset
        link will expire after 1 hour.
      </Typography>

      <FormAlert severity="error" message={submitError} />
      <FormAlert severity="success" message={successMessage} />

      <FormTextField
        {...register('email')}
        id="email"
        label="Email"
        type="email"
        error={errors.email}
        isSubmitting={isSubmitting}
        autoComplete="email"
        autoFocus
        aria-label="Email address"
        sx={{ mb: AUTH_CONSTANTS.FORM_SECTION_MARGIN_BOTTOM }}
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Sending...">
        Send Reset Instructions
      </SubmitButton>
    </Box>
  );
}

export default ResetPasswordRequestForm;
