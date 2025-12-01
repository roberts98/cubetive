import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schemas';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { useFormSubmit, usePasswordToggle } from '../hooks';
import FormTextField from './FormTextField';
import FormAlert from './FormAlert';
import SubmitButton from './SubmitButton';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { submitError, successMessage, handleFormSubmit } = useFormSubmit();
  const { showPassword, InputProps: passwordInputProps } = usePasswordToggle();
  const { showPassword: showConfirmPassword, InputProps: confirmPasswordInputProps } =
    usePasswordToggle();

  const {
    register,
    handleSubmit,
    control,
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

  const password = useWatch({ control, name: 'password' });

  const onFormSubmit = handleFormSubmit<RegisterFormData>(async (data) => {
    await onSubmit(data);
    reset();
    return 'Registration successful! Please check your email to verify your account.';
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
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
      />

      <FormTextField
        {...register('username')}
        id="username"
        label="Username"
        error={errors.username}
        helperText={`${AUTH_CONSTANTS.USERNAME_MIN_LENGTH}-${AUTH_CONSTANTS.USERNAME_MAX_LENGTH} characters, letters, numbers, _ and - only`}
        isSubmitting={isSubmitting}
        autoComplete="username"
        aria-label="Username"
      />

      <FormTextField
        {...register('password')}
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        error={errors.password}
        isSubmitting={isSubmitting}
        autoComplete="new-password"
        aria-label="Password"
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
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        error={errors.confirmPassword}
        isSubmitting={isSubmitting}
        autoComplete="new-password"
        aria-label="Confirm password"
        InputProps={confirmPasswordInputProps}
        sx={{ mb: AUTH_CONSTANTS.FORM_SECTION_MARGIN_BOTTOM }}
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Creating account...">
        Sign Up
      </SubmitButton>
    </Box>
  );
}

export default RegisterForm;
