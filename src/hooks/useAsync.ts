import { useCallback, useEffect, useState } from 'react';

/**
 * State for async operations
 */
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Options for configuring the useAsync hook
 */
type UseAsyncOptions = {
  /**
   * Whether to execute the async function immediately on mount
   * @default true
   */
  immediate?: boolean;
};

/**
 * Return type for the useAsync hook
 */
type UseAsyncReturn<T> = AsyncState<T> & {
  /**
   * Function to manually trigger the async operation
   */
  execute: () => Promise<void>;
  /**
   * Function to reset the state to initial values
   */
  reset: () => void;
};

/**
 * Custom React hook for handling async operations with loading and error states.
 *
 * This hook abstracts common async operation patterns:
 * - Automatic loading state management
 * - Error handling and state management
 * - Manual execution/refetch capability
 * - State reset functionality
 *
 * @template T - The type of data returned by the async function
 * @param {() => Promise<T>} asyncFunction - The async function to execute
 * @param {UseAsyncOptions} options - Configuration options
 * @returns {UseAsyncReturn<T>} Async state and control functions
 *
 * @example
 * // Basic usage with immediate execution
 * const { data, loading, error, execute } = useAsync(fetchUserData);
 *
 * @example
 * // Manual execution only
 * const { data, loading, error, execute } = useAsync(
 *   () => submitForm(formData),
 *   { immediate: false }
 * );
 *
 * @example
 * // With reset functionality
 * const { data, loading, error, execute, reset } = useAsync(fetchProfile);
 * // Later: reset() to clear data/error and return to initial state
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setState({ data: null, loading: false, error });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      // Execute async function on mount when immediate is true
      // This is intentional for data fetching on component mount
      void execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}
