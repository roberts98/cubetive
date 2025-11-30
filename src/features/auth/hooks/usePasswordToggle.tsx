import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Custom hook for password visibility toggle
 * Provides state and InputProps for TextField password fields
 *
 * @param disabled - Whether the toggle button should be disabled
 * @returns Object with showPassword state and InputProps for TextField
 *
 * @example
 * const { showPassword, InputProps } = usePasswordToggle(isSubmitting);
 * <TextField type={showPassword ? 'text' : 'password'} InputProps={InputProps} />
 */
export function usePasswordToggle(disabled: boolean = false) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const InputProps = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={togglePasswordVisibility}
          edge="end"
          disabled={disabled}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  };

  return {
    showPassword,
    setShowPassword,
    togglePasswordVisibility,
    InputProps,
  };
}
