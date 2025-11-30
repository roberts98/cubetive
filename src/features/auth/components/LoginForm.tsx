import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { loginSchema } from '../schemas/auth.schemas';
import type { z } from 'zod';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import { useFormSubmit } from '../hooks/useFormSubmit';
import FormTextField from './FormTextField';
import FormAlert from './FormAlert';
import SubmitButton from './SubmitButton';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  defaultEmail?: string;
}

function LoginForm({ onSubmit, defaultEmail = '' }: LoginFormProps) {
  const { submitError, handleFormSubmit } = useFormSubmit();
  const { showPassword, InputProps: passwordInputProps } = usePasswordToggle();

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

  const onFormSubmit: SubmitHandler<LoginFormData> = handleFormSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <FormAlert severity="error" message={submitError} />

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
        {...register('password')}
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        error={errors.password}
        isSubmitting={isSubmitting}
        autoComplete="current-password"
        aria-label="Password"
        InputProps={passwordInputProps}
      />

      <FormControlLabel
        control={<Checkbox {...register('rememberMe')} id="rememberMe" disabled={isSubmitting} />}
        label={`Remember me for ${AUTH_CONSTANTS.REMEMBER_ME_DURATION_DAYS} days`}
        sx={{ mb: AUTH_CONSTANTS.FORM_FIELD_MARGIN_BOTTOM }}
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Logging in...">
        Login
      </SubmitButton>
    </Box>
  );
}

export default LoginForm;
