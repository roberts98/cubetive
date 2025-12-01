import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from './authStore';
import { AuthService } from '../services/authService';
import { supabase } from '../../../db/supabase';
import { checkUsernameAvailability } from '../../profile/services/profileService';
import type { User, Session } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('../services/authService');
vi.mock('../../../db/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
    },
  },
}));
vi.mock('../../profile/services/profileService');

describe('authStore', () => {
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

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      loading: true,
      initialized: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.initialized).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize with existing session', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue(mockSession);
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { id: 'test-id', callback: vi.fn(), unsubscribe: vi.fn() } },
      } as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(true);
      expect(AuthService.getSession).toHaveBeenCalled();
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should initialize with no session', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue(null);
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { id: 'test-id', callback: vi.fn(), unsubscribe: vi.fn() } },
      } as ReturnType<typeof supabase.auth.onAuthStateChange>);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      vi.mocked(AuthService.getSession).mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize auth:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should set up auth state change listener', async () => {
      vi.mocked(AuthService.getSession).mockResolvedValue(null);
      const mockOnAuthStateChange = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should update state when auth state changes', async () => {
      let authStateCallback: Parameters<typeof supabase.auth.onAuthStateChange>[0];
      vi.mocked(AuthService.getSession).mockResolvedValue(null);
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { id: 'test-id', callback: vi.fn(), unsubscribe: vi.fn() } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>;
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      // Simulate auth state change
      act(() => {
        authStateCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.session).toEqual(mockSession);
      });
    });

    it('should handle auth state change to null session', async () => {
      let authStateCallback: Parameters<typeof supabase.auth.onAuthStateChange>[0];
      vi.mocked(AuthService.getSession).mockResolvedValue(mockSession);
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { id: 'test-id', callback: vi.fn(), unsubscribe: vi.fn() } },
        } as ReturnType<typeof supabase.auth.onAuthStateChange>;
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initialize();
      });

      // User logs out
      act(() => {
        authStateCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({ user: mockUser, session: mockSession });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(AuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during sign in', async () => {
      vi.mocked(AuthService.login).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ user: mockUser, session: mockSession }), 100)
          )
      );

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle sign in errors', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Invalid credentials');
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('signUp', () => {
    it('should successfully sign up user with available username', async () => {
      vi.mocked(checkUsernameAvailability).mockResolvedValue(true);
      vi.mocked(AuthService.register).mockResolvedValue({ user: mockUser, session: mockSession });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'testuser');
      });

      expect(checkUsernameAvailability).toHaveBeenCalledWith('testuser');
      expect(AuthService.register).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'testuser'
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
    });

    it('should throw error if username is already taken', async () => {
      vi.mocked(checkUsernameAvailability).mockResolvedValue(false);

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.signUp('test@example.com', 'password123', 'takenuser');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Username is already taken');
      expect(checkUsernameAvailability).toHaveBeenCalledWith('takenuser');
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during sign up', async () => {
      vi.mocked(checkUsernameAvailability).mockResolvedValue(true);
      vi.mocked(AuthService.register).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ user: mockUser, session: mockSession }), 100)
          )
      );

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signUp('test@example.com', 'password123', 'testuser');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle sign up errors', async () => {
      vi.mocked(checkUsernameAvailability).mockResolvedValue(true);
      vi.mocked(AuthService.register).mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.signUp('existing@example.com', 'password123', 'testuser');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Email already exists');
      expect(result.current.loading).toBe(false);
    });

    it('should handle username check errors', async () => {
      vi.mocked(checkUsernameAvailability).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.signUp('test@example.com', 'password123', 'testuser');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Network error');
      expect(AuthService.register).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      vi.mocked(AuthService.logout).mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
      });

      expect(result.current.user).toEqual(mockUser);

      await act(async () => {
        await result.current.signOut();
      });

      expect(AuthService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during sign out', async () => {
      vi.mocked(AuthService.logout).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(), 100))
      );

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signOut();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle sign out errors', async () => {
      vi.mocked(AuthService.logout).mockRejectedValue(new Error('Sign out failed'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.signOut();
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Sign out failed');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should successfully request password reset', async () => {
      vi.mocked(AuthService.requestPasswordReset).mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during password reset request', async () => {
      vi.mocked(AuthService.requestPasswordReset).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(), 100))
      );

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.resetPassword('test@example.com');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle password reset errors', async () => {
      vi.mocked(AuthService.requestPasswordReset).mockRejectedValue(new Error('Invalid email'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.resetPassword('invalid@example.com');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Invalid email');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      vi.mocked(AuthService.updatePassword).mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.updatePassword('newPassword123');
      });

      expect(AuthService.updatePassword).toHaveBeenCalledWith('newPassword123');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during password update', async () => {
      vi.mocked(AuthService.updatePassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(), 100))
      );

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updatePassword('newPassword123');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle password update errors', async () => {
      vi.mocked(AuthService.updatePassword).mockRejectedValue(new Error('Password too weak'));

      const { result } = renderHook(() => useAuthStore());

      let error: Error | undefined;
      await act(async () => {
        try {
          await result.current.updatePassword('weak');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeDefined();
      expect(error?.message).toBe('Password too weak');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should manually set user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should set user to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should manually set session and extract user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should set session to null and clear user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.user).toEqual(mockUser);

      act(() => {
        result.current.setSession(null);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should manually set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete sign up to sign in flow', async () => {
      // Sign up
      vi.mocked(checkUsernameAvailability).mockResolvedValue(true);
      vi.mocked(AuthService.register).mockResolvedValue({
        user: { ...mockUser, confirmed_at: undefined },
        session: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123', 'testuser');
      });

      expect(result.current.session).toBeNull();

      // Sign in after email verification
      vi.mocked(AuthService.login).mockResolvedValue({ user: mockUser, session: mockSession });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should handle sign in and sign out flow', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({ user: mockUser, session: mockSession });
      vi.mocked(AuthService.logout).mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      // Sign in
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);

      // Sign out
      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should maintain state across multiple hook instances', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({ user: mockUser, session: mockSession });

      const { result: result1 } = renderHook(() => useAuthStore());
      const { result: result2 } = renderHook(() => useAuthStore());

      await act(async () => {
        await result1.current.signIn('test@example.com', 'password123');
      });

      // Both instances should see the same state
      expect(result1.current.user).toEqual(mockUser);
      expect(result2.current.user).toEqual(mockUser);
    });
  });
});
