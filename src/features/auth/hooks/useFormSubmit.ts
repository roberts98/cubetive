import { useState } from 'react';
import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';

/**
 * Custom hook for form submission with error and success handling
 * Manages submitError and successMessage states with consistent error handling
 *
 * @returns Object with state and handlers for form submission
 *
 * @example
 * const { submitError, successMessage, handleFormSubmit, clearMessages } = useFormSubmit();
 *
 * const onSubmit = handleFormSubmit(async (data) => {
 *   await myApiCall(data);
 *   return 'Success message'; // Optional
 * });
 */
export function useFormSubmit() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setSubmitError(null);
    setSuccessMessage(null);
  };

  /**
   * Wraps an async function with error and success handling
   * @param submitFn - Async function that performs the submission
   * @returns Wrapped function that handles errors and success
   */
  const handleFormSubmit = <T = unknown>(
    submitFn: (data: T) => Promise<string | void>
  ): ((data: T) => Promise<void>) => {
    return async (data: T) => {
      clearMessages();

      try {
        const result = await submitFn(data);
        if (result) {
          setSuccessMessage(result);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.DEFAULT;
        setSubmitError(errorMessage);
        // Don't re-throw - let the form handle the error state
      }
    };
  };

  return {
    submitError,
    successMessage,
    setSubmitError,
    setSuccessMessage,
    clearMessages,
    handleFormSubmit,
  };
}
