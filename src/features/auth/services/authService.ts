import { supabase } from '../../../db/supabase';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Authentication Service
 *
 * Centralized service for all Supabase Auth operations.
 * Provides error handling and user-friendly error messages.
 */

export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export class AuthService {
  /**
   * Register a new user with email, password, and username
   */
  static async register(email: string, password: string, username: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          username, // Stored in auth.users.raw_user_meta_data
        },
      },
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Sign in with email and password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    // Enforce email confirmation (Supabase local dev doesn't enforce by default)
    if (data.user && !data.user.confirmed_at) {
      // Sign out the unconfirmed user
      await supabase.auth.signOut();
      throw new Error('Email not confirmed');
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Sign out the current user
   */
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(this.mapError(error.message));
    }
  }

  /**
   * Get the current session
   */
  static async getSession(): Promise<Session | null> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    return session;
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    return user;
  }

  /**
   * Request password reset email
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }
  }

  /**
   * Update user password (requires active recovery session)
   */
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }
  }

  /**
   * Verify OTP token (for email verification)
   */
  static async verifyOtp(
    tokenHash: string,
    type: 'email' | 'recovery' = 'email'
  ): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Verify email with 6-digit code
   */
  static async verifyEmailWithCode(email: string, code: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (error) {
      throw new Error(this.mapError(error.message));
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Map Supabase error messages to user-friendly messages
   */
  private static mapError(errorMessage: string): string {
    // Error mapping based on spec (Section 2.3.1, lines 858-869)
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email address before logging in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 8 characters',
      'Password should be at least 8 characters': 'Password must be at least 8 characters',
      'Username already exists': 'Username is already taken',
      'Invalid email': 'Please enter a valid email address',
      'Signup requires a valid password': 'Password must be at least 8 characters',
      'User not found': 'Invalid email or password',
    };

    // Check for exact match
    if (errorMap[errorMessage]) {
      return errorMap[errorMessage];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Default error message
    return 'An error occurred. Please try again.';
  }
}
