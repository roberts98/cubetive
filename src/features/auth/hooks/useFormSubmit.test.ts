import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmit } from './useFormSubmit';
import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';

describe('useFormSubmit', () => {
  describe('initial state', () => {
    it('should initialize with null submitError and successMessage', () => {
      const { result } = renderHook(() => useFormSubmit());

      expect(result.current.submitError).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });

    it('should provide all expected functions', () => {
      const { result } = renderHook(() => useFormSubmit());

      expect(typeof result.current.handleFormSubmit).toBe('function');
      expect(typeof result.current.clearMessages).toBe('function');
      expect(typeof result.current.setSubmitError).toBe('function');
      expect(typeof result.current.setSuccessMessage).toBe('function');
    });
  });

  describe('clearMessages', () => {
    it('should clear both error and success messages', () => {
      const { result } = renderHook(() => useFormSubmit());

      // Set messages
      act(() => {
        result.current.setSubmitError('Test error');
        result.current.setSuccessMessage('Test success');
      });

      expect(result.current.submitError).toBe('Test error');
      expect(result.current.successMessage).toBe('Test success');

      // Clear messages
      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.submitError).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });
  });

  describe('setSubmitError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSubmitError('Custom error message');
      });

      expect(result.current.submitError).toBe('Custom error message');
    });

    it('should overwrite previous error message', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSubmitError('First error');
      });

      expect(result.current.submitError).toBe('First error');

      act(() => {
        result.current.setSubmitError('Second error');
      });

      expect(result.current.submitError).toBe('Second error');
    });

    it('should allow setting error to null', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSubmitError('Error message');
      });

      expect(result.current.submitError).toBe('Error message');

      act(() => {
        result.current.setSubmitError(null);
      });

      expect(result.current.submitError).toBeNull();
    });
  });

  describe('setSuccessMessage', () => {
    it('should set success message', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSuccessMessage('Operation successful');
      });

      expect(result.current.successMessage).toBe('Operation successful');
    });

    it('should overwrite previous success message', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSuccessMessage('First success');
      });

      expect(result.current.successMessage).toBe('First success');

      act(() => {
        result.current.setSuccessMessage('Second success');
      });

      expect(result.current.successMessage).toBe('Second success');
    });

    it('should allow setting success message to null', () => {
      const { result } = renderHook(() => useFormSubmit());

      act(() => {
        result.current.setSuccessMessage('Success message');
      });

      expect(result.current.successMessage).toBe('Success message');

      act(() => {
        result.current.setSuccessMessage(null);
      });

      expect(result.current.successMessage).toBeNull();
    });
  });

  describe('handleFormSubmit - success cases', () => {
    it('should execute submitFn and clear messages on success', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        await wrappedFn({ testData: 'value' });
      });

      expect(mockSubmitFn).toHaveBeenCalledWith({ testData: 'value' });
      expect(result.current.submitError).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });

    it('should set success message when submitFn returns a string', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockResolvedValue('Operation completed successfully');

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        await wrappedFn({ testData: 'value' });
      });

      expect(result.current.successMessage).toBe('Operation completed successfully');
      expect(result.current.submitError).toBeNull();
    });

    it('should not set success message when submitFn returns void', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockResolvedValue(undefined);

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        await wrappedFn({ testData: 'value' });
      });

      expect(result.current.successMessage).toBeNull();
      expect(result.current.submitError).toBeNull();
    });

    it('should clear previous error messages before successful submission', async () => {
      const { result } = renderHook(() => useFormSubmit());

      // Set an error first
      act(() => {
        result.current.setSubmitError('Previous error');
      });

      expect(result.current.submitError).toBe('Previous error');

      const mockSubmitFn = vi.fn().mockResolvedValue('Success!');
      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        await wrappedFn({ testData: 'value' });
      });

      expect(result.current.submitError).toBeNull();
      expect(result.current.successMessage).toBe('Success!');
    });

    it('should handle multiple successful submissions', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockResolvedValue('Success message');

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      // First submission
      await act(async () => {
        await wrappedFn({ attempt: 1 });
      });

      expect(result.current.successMessage).toBe('Success message');
      expect(mockSubmitFn).toHaveBeenCalledTimes(1);

      // Second submission
      await act(async () => {
        await wrappedFn({ attempt: 2 });
      });

      expect(result.current.successMessage).toBe('Success message');
      expect(mockSubmitFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleFormSubmit - error cases', () => {
    it('should set error message when submitFn throws Error', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockRejectedValue(new Error('Custom error message'));

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch {
          // Error is re-thrown, catch it to prevent test failure
        }
      });

      expect(result.current.submitError).toBe('Custom error message');
      expect(result.current.successMessage).toBeNull();
    });

    it('should use default error message for non-Error exceptions', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockRejectedValue('String error');

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch {
          // Error is re-thrown
        }
      });

      expect(result.current.submitError).toBe(AUTH_ERROR_MESSAGES.DEFAULT);
      expect(result.current.successMessage).toBeNull();
    });

    it('should use default error message for null exception', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockRejectedValue(null);

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch {
          // Error is re-thrown
        }
      });

      expect(result.current.submitError).toBe(AUTH_ERROR_MESSAGES.DEFAULT);
    });

    it('should use default error message for undefined exception', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockRejectedValue(undefined);

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch {
          // Error is re-thrown
        }
      });

      expect(result.current.submitError).toBe(AUTH_ERROR_MESSAGES.DEFAULT);
    });

    it('should re-throw the error after setting state', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockError = new Error('Test error');
      const mockSubmitFn = vi.fn().mockRejectedValue(mockError);

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      let caughtError: Error | undefined;
      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch (e) {
          caughtError = e as Error;
        }
      });

      expect(caughtError).toBeDefined();
      expect(caughtError?.message).toBe('Test error');
      expect(result.current.submitError).toBe('Test error');
    });

    it('should clear previous success message on error', async () => {
      const { result } = renderHook(() => useFormSubmit());

      // Set a success message first
      act(() => {
        result.current.setSuccessMessage('Previous success');
      });

      expect(result.current.successMessage).toBe('Previous success');

      const mockSubmitFn = vi.fn().mockRejectedValue(new Error('Error occurred'));
      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      await act(async () => {
        try {
          await wrappedFn({ testData: 'value' });
        } catch {
          // Error is re-thrown
        }
      });

      expect(result.current.successMessage).toBeNull();
      expect(result.current.submitError).toBe('Error occurred');
    });

    it('should clear messages before each submission attempt', async () => {
      const { result } = renderHook(() => useFormSubmit());

      // First submission - success
      const successFn = vi.fn().mockResolvedValue('Success');
      const wrappedSuccessFn = result.current.handleFormSubmit(successFn);

      await act(async () => {
        await wrappedSuccessFn({ attempt: 1 });
      });

      expect(result.current.successMessage).toBe('Success');

      // Second submission - error
      const errorFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const wrappedErrorFn = result.current.handleFormSubmit(errorFn);

      await act(async () => {
        try {
          await wrappedErrorFn({ attempt: 2 });
        } catch {
          // Error is re-thrown
        }
      });

      // Success message should be cleared, error should be set
      expect(result.current.successMessage).toBeNull();
      expect(result.current.submitError).toBe('Failed');
    });
  });

  describe('handleFormSubmit - type safety', () => {
    it('should pass through typed data correctly', async () => {
      const { result } = renderHook(() => useFormSubmit());

      interface FormData {
        email: string;
        password: string;
      }

      const mockSubmitFn = vi.fn<[FormData], Promise<string>>().mockResolvedValue('Success');
      const wrappedFn = result.current.handleFormSubmit<FormData>(mockSubmitFn);

      await act(async () => {
        await wrappedFn({ email: 'test@example.com', password: 'password123' });
      });

      expect(mockSubmitFn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle complex data types', async () => {
      const { result } = renderHook(() => useFormSubmit());

      interface ComplexData {
        user: {
          name: string;
          age: number;
        };
        settings: string[];
      }

      const mockSubmitFn = vi.fn<[ComplexData], Promise<void>>().mockResolvedValue();
      const wrappedFn = result.current.handleFormSubmit<ComplexData>(mockSubmitFn);

      const testData: ComplexData = {
        user: { name: 'John', age: 30 },
        settings: ['opt1', 'opt2'],
      };

      await act(async () => {
        await wrappedFn(testData);
      });

      expect(mockSubmitFn).toHaveBeenCalledWith(testData);
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid successive submissions', async () => {
      const { result } = renderHook(() => useFormSubmit());
      const mockSubmitFn = vi.fn().mockResolvedValue('Success');

      const wrappedFn = result.current.handleFormSubmit(mockSubmitFn);

      // Rapid submissions
      await act(async () => {
        await Promise.all([
          wrappedFn({ attempt: 1 }),
          wrappedFn({ attempt: 2 }),
          wrappedFn({ attempt: 3 }),
        ]);
      });

      expect(mockSubmitFn).toHaveBeenCalledTimes(3);
      expect(result.current.successMessage).toBe('Success');
    });

    it('should maintain independent state across multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useFormSubmit());
      const { result: result2 } = renderHook(() => useFormSubmit());

      act(() => {
        result1.current.setSubmitError('Error 1');
        result2.current.setSuccessMessage('Success 2');
      });

      expect(result1.current.submitError).toBe('Error 1');
      expect(result1.current.successMessage).toBeNull();
      expect(result2.current.submitError).toBeNull();
      expect(result2.current.successMessage).toBe('Success 2');
    });

    it('should work with async operations that take time', async () => {
      const { result } = renderHook(() => useFormSubmit());

      const slowSubmitFn = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('Completed'), 100);
          })
      );

      const wrappedFn = result.current.handleFormSubmit(slowSubmitFn);

      await act(async () => {
        await wrappedFn({ testData: 'value' });
      });

      await waitFor(() => {
        expect(result.current.successMessage).toBe('Completed');
      });
    });
  });
});
