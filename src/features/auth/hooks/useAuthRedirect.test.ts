import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import { useAuthRedirect } from './useAuthRedirect';
import { useAuthStore } from '../stores/authStore';
import type { User } from '@supabase/supabase-js';

// Mock react-router-dom navigation
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth store
vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useAuthRedirect', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    confirmed_at: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue(null);
    });

    it('should not redirect if user is null', () => {
      renderHook(() => useAuthRedirect(), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not redirect with custom destination if user is null', () => {
      renderHook(() => useAuthRedirect('/custom-path'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);
    });

    it('should redirect to default path (/dashboard) when user is authenticated', async () => {
      renderHook(() => useAuthRedirect(), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should redirect to custom path when specified', async () => {
      renderHook(() => useAuthRedirect('/profile'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
      });
    });

    it('should use replace navigation to avoid back button issues', async () => {
      renderHook(() => useAuthRedirect('/dashboard'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), { replace: true });
      });
    });
  });

  describe('preserveFromLocation parameter', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);
    });

    it('should redirect to original destination from location state when preserveFromLocation is true', async () => {
      const initialEntries = [
        {
          pathname: '/login',
          state: { from: { pathname: '/protected-page' } },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/protected-page', { replace: true });
      });
    });

    it('should redirect to default path when preserveFromLocation is true but no from location', async () => {
      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should ignore from location when preserveFromLocation is false', async () => {
      const initialEntries = [
        {
          pathname: '/register',
          state: { from: { pathname: '/protected-page' } },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', false), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should default preserveFromLocation to true', async () => {
      const initialEntries = [
        {
          pathname: '/login',
          state: { from: { pathname: '/timer' } },
        },
      ];

      // Call without second parameter
      renderHook(() => useAuthRedirect('/dashboard'), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/timer', { replace: true });
      });
    });
  });

  describe('reactivity to user state changes', () => {
    it('should redirect when user becomes authenticated', async () => {
      // Start with no user
      vi.mocked(useAuthStore).mockReturnValue(null);

      const { rerender } = renderHook(() => useAuthRedirect('/dashboard'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      expect(mockNavigate).not.toHaveBeenCalled();

      // User logs in
      vi.mocked(useAuthStore).mockReturnValue(mockUser);
      rerender();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should not redirect when user logs out', async () => {
      // Start with authenticated user
      vi.mocked(useAuthStore).mockReturnValue(mockUser);

      const { rerender } = renderHook(() => useAuthRedirect('/dashboard'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      mockNavigate.mockClear();

      // User logs out
      vi.mocked(useAuthStore).mockReturnValue(null);
      rerender();

      // Should not navigate again
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);
    });

    it('should handle location state with missing pathname', async () => {
      const initialEntries = [
        {
          pathname: '/login',
          state: { from: {} }, // Missing pathname
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle location state with null from', async () => {
      const initialEntries = [
        {
          pathname: '/login',
          state: { from: null },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle empty redirectTo parameter', async () => {
      renderHook(() => useAuthRedirect(''), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('', { replace: true });
      });
    });

    it('should handle root path redirectTo', async () => {
      renderHook(() => useAuthRedirect('/'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should handle redirectTo with query params', async () => {
      renderHook(() => useAuthRedirect('/dashboard?tab=profile'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=profile', { replace: true });
      });
    });

    it('should handle from location with query params', async () => {
      const initialEntries = [
        {
          pathname: '/login',
          state: { from: { pathname: '/timer?session=abc123' } },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/timer?session=abc123', { replace: true });
      });
    });
  });

  describe('typical use cases', () => {
    it('should work for login page (preserve return URL)', async () => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);

      const initialEntries = [
        {
          pathname: '/login',
          state: { from: { pathname: '/timer' } },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', true), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/timer', { replace: true });
      });
    });

    it('should work for register page (always go to dashboard)', async () => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);

      const initialEntries = [
        {
          pathname: '/register',
          state: { from: { pathname: '/timer' } },
        },
      ];

      renderHook(() => useAuthRedirect('/dashboard', false), {
        wrapper: ({ children }) => createElement(MemoryRouter, { initialEntries }, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should work for password reset page (go to dashboard)', async () => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);

      renderHook(() => useAuthRedirect('/dashboard', false), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });

  describe('multiple renders', () => {
    it('should only navigate once even with multiple rerenders', async () => {
      vi.mocked(useAuthStore).mockReturnValue(mockUser);

      const { rerender } = renderHook(() => useAuthRedirect('/dashboard'), {
        wrapper: ({ children }) => createElement(MemoryRouter, null, children),
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      // Multiple rerenders
      rerender();
      rerender();
      rerender();

      // Should still only have been called once
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
