import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'children'> {
  isSubmitting: boolean;
  loadingText: string;
  children: string;
}

/**
 * Reusable submit button with loading state
 * Displays a spinner and custom text when submitting
 *
 * @param isSubmitting - Whether the form is currently submitting
 * @param loadingText - Text to display during submission
 * @param children - Button text when not submitting
 *
 * @example
 * <SubmitButton isSubmitting={isSubmitting} loadingText="Logging in...">
 *   Login
 * </SubmitButton>
 */
function SubmitButton({ isSubmitting, loadingText, children, ...buttonProps }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      size="large"
      disabled={isSubmitting}
      sx={{ mb: AUTH_CONSTANTS.FORM_FIELD_MARGIN_BOTTOM, ...buttonProps.sx }}
      {...buttonProps}
    >
      {isSubmitting ? (
        <>
          <CircularProgress size={AUTH_CONSTANTS.SPINNER_SIZE} sx={{ mr: 1 }} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default SubmitButton;
