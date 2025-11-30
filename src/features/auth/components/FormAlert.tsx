import { Alert } from '@mui/material';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

interface FormAlertProps {
  severity: 'error' | 'success' | 'info' | 'warning';
  message: string | null;
}

/**
 * Reusable form alert component
 * Only renders when message is not null
 *
 * @param severity - Alert severity level
 * @param message - Alert message (null = don't render)
 *
 * @example
 * <FormAlert severity="error" message={submitError} />
 * <FormAlert severity="success" message={successMessage} />
 */
function FormAlert({ severity, message }: FormAlertProps) {
  if (!message) return null;

  return (
    <Alert severity={severity} sx={{ mb: AUTH_CONSTANTS.FORM_FIELD_MARGIN_BOTTOM }} role="alert">
      {message}
    </Alert>
  );
}

export default FormAlert;
