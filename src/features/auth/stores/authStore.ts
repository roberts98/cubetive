import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';
import { supabase } from '../../../db/supabase';
import { checkUsernameAvailability } from '../../profile/services/profileService';

/**
 * Auth Store State Interface
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

/**
 * Auth Store Actions Interface
 */
interface AuthActions {
  // Auth operations
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;

  // State management
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

/**
 * Combined Auth Store Interface
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Zustand Auth Store
 *
 * Manages authentication state and provides actions for auth operations.
 * Uses localStorage for session persistence (MVP approach).
 */
export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  session: null,
  loading: true,
  initialized: false,

  /**
   * Initialize auth state by checking for existing session
   * Should be called once on app startup
   */
  initialize: async () => {
    try {
      set({ loading: true });

      // Get current session from Supabase
      const session = await AuthService.getSession();

      if (session) {
        set({
          user: session.user,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session: session,
        });
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { user, session } = await AuthService.login(email, password);
      set({ user, session, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Sign up new user with email, password, and username
   * Checks username availability before attempting registration
   */
  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true });

      // Check username availability (per decision: on submission only)
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      const { user, session } = await AuthService.register(email, password, username);

      // Note: user won't have session until email is verified
      set({ user, session, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    try {
      set({ loading: true });
      await AuthService.logout();
      // Clear the state immediately
      set({ user: null, session: null, loading: false });

      // Force a small delay to ensure Supabase clears storage
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Request password reset email
   */
  resetPassword: async (email: string) => {
    try {
      set({ loading: true });
      await AuthService.requestPasswordReset(email);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Update user password (requires recovery session)
   */
  updatePassword: async (password: string) => {
    try {
      set({ loading: true });
      await AuthService.updatePassword(password);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Manually set user (used by auth flows)
   */
  setUser: (user: User | null) => {
    set({ user });
  },

  /**
   * Manually set session (used by auth flows)
   */
  setSession: (session: Session | null) => {
    set({ session, user: session?.user ?? null });
  },

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));
