import { useState } from 'react';
import { showSuccess, showError } from '../utils/notifications';

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  error: Error | null;
}

/**
 * Custom hook for copying text to clipboard with built-in notifications
 *
 * @param options - Configuration options for success/error messages
 * @returns Object with copy function, copied state, and error state
 *
 * @example
 * const { copy, copied } = useClipboard({
 *   successMessage: 'Link copied!',
 *   errorMessage: 'Failed to copy link'
 * });
 *
 * <Button onClick={() => copy('https://example.com')}>
 *   Copy Link
 * </Button>
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      if (options.successMessage) {
        showSuccess(options.successMessage);
      }

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy to clipboard');
      setError(error);
      setCopied(false);

      if (options.errorMessage) {
        showError(options.errorMessage);
      }

      console.error('Failed to copy to clipboard:', error);
    }
  };

  return { copy, copied, error };
}
