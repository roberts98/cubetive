import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from './authService';
import { supabase } from '../../../db/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('../../../db/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      verifyOtp: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.register('test@example.com', 'password123', 'testuser');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            username: 'testuser',
          },
        },
      });
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('should throw mapped error for duplicate email', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          name: 'AuthError',
          status: 400,
          code: 'user_already_exists',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(
        AuthService.register('duplicate@example.com', 'password123', 'testuser')
      ).rejects.toThrow('An account with this email already exists');
    });

    it('should throw mapped error for weak password', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Password should be at least 8 characters',
          name: 'AuthError',
          status: 400,
          code: 'weak_password',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.register('test@example.com', 'weak', 'testuser')).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should throw default error for unknown errors', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Unknown error occurred',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(
        AuthService.register('test@example.com', 'password123', 'testuser')
      ).rejects.toThrow('An error occurred. Please try again.');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.login('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('should throw mapped error for invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should enforce email confirmation and sign out unconfirmed users', async () => {
      const unconfirmedUser = { ...mockUser, confirmed_at: undefined };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: unconfirmedUser, session: mockSession },
        error: null,
      });
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      await expect(AuthService.login('test@example.com', 'password123')).rejects.toThrow(
        'Email not confirmed'
      );

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should map "User not found" to user-friendly message', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User not found',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('nonexistent@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('logout', () => {
    it('should successfully sign out user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      await expect(AuthService.logout()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error if sign out fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: {
          message: 'Sign out failed',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.logout()).rejects.toThrow('An error occurred. Please try again.');
    });
  });

  describe('getSession', () => {
    it('should return current session if exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null if no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toBeNull();
    });

    it('should throw error if getSession fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: {
          message: 'Failed to get session',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.getSession()).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null if no user is authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null as unknown as User },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should throw error if getUser fails', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Failed to get user',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.getCurrentUser()).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should successfully send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      await expect(AuthService.requestPasswordReset('test@example.com')).resolves.toBeUndefined();

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${window.location.origin}/update-password`,
      });
    });

    it('should throw error if password reset fails', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null,
        error: {
          message: 'Failed to send reset email',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.requestPasswordReset('test@example.com')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });

    it('should map invalid email error', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid email',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.requestPasswordReset('invalid-email')).rejects.toThrow(
        'Please enter a valid email address'
      );
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await expect(AuthService.updatePassword('newPassword123')).resolves.toBeUndefined();

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });

    it('should throw error if password update fails', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Failed to update password',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.updatePassword('newPassword123')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });

    it('should map weak password error', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Password should be at least 8 characters',
          name: 'AuthError',
          status: 400,
          code: 'weak_password',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.updatePassword('weak')).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should successfully resend verification email', async () => {
      vi.mocked(supabase.auth.resend).mockResolvedValue({
        data: { user: null, session: null, messageId: 'test-message-id' },
        error: null,
      });

      await expect(
        AuthService.resendVerificationEmail('test@example.com')
      ).resolves.toBeUndefined();

      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });
    });

    it('should throw error if resend fails', async () => {
      vi.mocked(supabase.auth.resend).mockResolvedValue({
        data: { user: null, session: null, messageId: null },
        error: {
          message: 'Failed to resend email',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.resendVerificationEmail('test@example.com')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('verifyOtp', () => {
    it('should successfully verify OTP token for email verification', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.verifyOtp('test-token-hash', 'email');

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'test-token-hash',
        type: 'email',
      });
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('should successfully verify OTP token for password recovery', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.verifyOtp('test-token-hash', 'recovery');

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'test-token-hash',
        type: 'recovery',
      });
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('should default to email type if not specified', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await AuthService.verifyOtp('test-token-hash');

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'test-token-hash',
        type: 'email',
      });
    });

    it('should throw error for invalid or expired token', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Token has expired or is invalid',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.verifyOtp('invalid-token')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('verifyEmailWithCode', () => {
    it('should successfully verify email with 6-digit code', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.verifyEmailWithCode('test@example.com', '123456');

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it('should throw error for invalid code', async () => {
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid or expired verification code',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.verifyEmailWithCode('test@example.com', '000000')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });

  describe('mapError', () => {
    it('should map "Invalid login credentials" to user-friendly message', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should map "Email not confirmed" to user-friendly message', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email not confirmed',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('test@example.com', 'password')).rejects.toThrow(
        'Please verify your email address before logging in'
      );
    });

    it('should map "Username already exists" to user-friendly message', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Username already exists',
          name: 'AuthError',
          status: 400,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(
        AuthService.register('test@example.com', 'password123', 'taken')
      ).rejects.toThrow('Username is already taken');
    });

    it('should handle partial matches in error messages', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Something went wrong: Invalid login credentials',
          name: 'AuthError',
          status: 400,
          code: 'invalid_credentials',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should return default message for unmapped errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Network error occurred',
          name: 'AuthError',
          status: 500,
          code: 'error',
          __isAuthError: true,
        } as unknown as AuthError,
      });

      await expect(AuthService.login('test@example.com', 'password')).rejects.toThrow(
        'An error occurred. Please try again.'
      );
    });
  });
});
