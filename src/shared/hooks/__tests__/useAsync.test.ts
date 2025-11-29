import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state when immediate is true', () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should execute async function immediately by default', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAsyncFn).toHaveBeenCalledOnce();
    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
  });

  it('should not execute immediately when immediate is false', () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFn, { immediate: false }));

    expect(mockAsyncFn).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
  });

  it('should handle successful async operation', async () => {
    const mockData = { id: '123', name: 'Test User' };
    const mockAsyncFn = vi.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle async operation errors', async () => {
    const mockError = new Error('Something went wrong');
    const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(mockError);
  });

  it('should convert non-Error objects to Error instances', async () => {
    const mockAsyncFn = vi.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('An unknown error occurred');
  });

  it('should allow manual execution via execute function', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(mockAsyncFn, { immediate: false }));

    expect(mockAsyncFn).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAsyncFn).toHaveBeenCalledOnce();
    expect(result.current.data).toBe('data');
  });

  it('should allow refetching data via execute function', async () => {
    let callCount = 0;
    const mockAsyncFn = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(`data-${callCount}`);
    });

    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.data).toBe('data-1');
    });

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('data-2');
    });

    expect(mockAsyncFn).toHaveBeenCalledTimes(2);
  });

  it('should reset state to initial values when reset is called', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('test data');
    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.data).toBe('test data');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should clear previous error when executing again', async () => {
    const mockError = new Error('First error');
    const mockAsyncFn = vi
      .fn()
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce('success data');

    const { result } = renderHook(() => useAsync(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.data).toBe('success data');
    });

    expect(result.current.error).toBe(null);
  });

  it('should set loading to true when executing', async () => {
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    const mockAsyncFn = vi.fn().mockReturnValue(promise);
    const { result } = renderHook(() => useAsync(mockAsyncFn, { immediate: false }));

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    act(() => {
      resolvePromise!('done');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle rapid successive execute calls', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(mockAsyncFn, { immediate: false }));

    await act(async () => {
      result.current.execute();
      result.current.execute();
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('data');
    expect(mockAsyncFn).toHaveBeenCalledTimes(3);
  });

  it('should maintain type safety with generic type parameter', async () => {
    type User = { id: string; name: string; age: number };
    const mockUser: User = { id: '1', name: 'John', age: 30 };
    const mockAsyncFn = vi.fn().mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAsync<User>(mockAsyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // TypeScript should infer data as User | null
    expect(result.current.data).toEqual(mockUser);
    if (result.current.data) {
      expect(result.current.data.id).toBe('1');
      expect(result.current.data.name).toBe('John');
      expect(result.current.data.age).toBe(30);
    }
  });
});
