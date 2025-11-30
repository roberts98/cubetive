import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { FieldError } from 'react-hook-form';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface FormTextFieldProps extends Omit<TextFieldProps, 'error' | 'helperText'> {
  error?: FieldError;
  helperText?: string;
  isSubmitting?: boolean;
}

/**
 * Reusable form text field with consistent styling and error handling
 * Automatically handles error state from React Hook Form
 *
 * @param error - React Hook Form error object
 * @param helperText - Additional helper text (shown when no error)
 * @param isSubmitting - Whether form is submitting (disables field)
 *
 * @example
 * <FormTextField
 *   {...register('email')}
 *   label="Email"
 *   type="email"
 *   error={errors.email}
 *   isSubmitting={isSubmitting}
 * />
 */
function FormTextField({
  error,
  helperText,
  isSubmitting = false,
  ...textFieldProps
}: FormTextFieldProps) {
  return (
    <TextField
      fullWidth
      error={!!error}
      helperText={error?.message || helperText}
      disabled={isSubmitting}
      required
      sx={{ mb: AUTH_CONSTANTS.FORM_FIELD_MARGIN_BOTTOM, ...textFieldProps.sx }}
      {...textFieldProps}
    />
  );
}

export default FormTextField;
