import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { updatePasswordSchema, type UpdatePasswordFormData } from '../schemas/auth.schemas';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import { useFormSubmit } from '../hooks/useFormSubmit';
import FormTextField from './FormTextField';
import FormAlert from './FormAlert';
import SubmitButton from './SubmitButton';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface UpdatePasswordFormProps {
  onSubmit: (data: UpdatePasswordFormData) => Promise<void>;
}

function UpdatePasswordForm({ onSubmit }: UpdatePasswordFormProps) {
  const { submitError, handleFormSubmit } = useFormSubmit();
  const { showPassword, InputProps: passwordInputProps } = usePasswordToggle();
  const { showPassword: showConfirmPassword, InputProps: confirmPasswordInputProps } =
    usePasswordToggle();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  const onFormSubmit = handleFormSubmit<UpdatePasswordFormData>(async (data) => {
    await onSubmit(data);
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <FormAlert severity="error" message={submitError} />

      <FormTextField
        {...register('password')}
        id="password"
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        error={errors.password}
        isSubmitting={isSubmitting}
        autoComplete="new-password"
        autoFocus
        aria-label="New password"
        InputProps={passwordInputProps}
        sx={{ mb: 1 }}
      />

      <PasswordStrengthIndicator password={password} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
        Password must be at least {AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters
      </Typography>

      <FormTextField
        {...register('confirmPassword')}
        id="confirmPassword"
        label="Confirm New Password"
        type={showConfirmPassword ? 'text' : 'password'}
        error={errors.confirmPassword}
        isSubmitting={isSubmitting}
        autoComplete="new-password"
        aria-label="Confirm new password"
        InputProps={confirmPasswordInputProps}
        sx={{ mb: AUTH_CONSTANTS.FORM_SECTION_MARGIN_BOTTOM }}
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Updating password...">
        Update Password
      </SubmitButton>
    </Box>
  );
}

export default UpdatePasswordForm;
