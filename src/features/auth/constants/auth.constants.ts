/**
 * Authentication constants
 * Centralized constants for auth feature to avoid magic numbers and strings
 */

export const AUTH_CONSTANTS = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,

  // UI spacing (in theme units)
  FORM_FIELD_MARGIN_BOTTOM: 2,
  FORM_SECTION_MARGIN_BOTTOM: 3,

  // Loading spinner size
  SPINNER_SIZE: 20,

  // Auto-redirect timeout (ms)
  SUCCESS_REDIRECT_TIMEOUT: 3000,

  // Session duration (days)
  REMEMBER_ME_DURATION_DAYS: 30,
} as const;

export const AUTH_ERROR_MESSAGES = {
  DEFAULT: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
} as const;
