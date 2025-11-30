import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentUserProfile, checkUsernameAvailability, updateUsername } from './profileService';
import { supabase } from '../../../db/supabase';
import type { ProfileDTO } from '../../../types';
import type { User, AuthError } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('../../../db/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('profileService', () => {
  describe('getCurrentUserProfile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return profile for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' } as User;
      const mockProfile: ProfileDTO = {
        id: 'user-123',
        username: 'speedcuber123',
        profile_visibility: true,
        total_solves: 100,
        pb_single: 9800,
        pb_single_date: '2025-01-15T10:30:00Z',
        pb_single_scramble: "R U R' U' R' F R2 U' R' U' R U R' F'",
        pb_ao5: 11200,
        pb_ao5_date: '2025-01-14T15:45:00Z',
        pb_ao12: 12500,
        pb_ao12_date: '2025-01-13T09:20:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-15T10:30:00Z',
      };

      // Mock auth.getUser
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the query chain
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        single: mockSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await getCurrentUserProfile();

      expect(result).toEqual(mockProfile);
      expect(supabase.auth.getUser).toHaveBeenCalledOnce();
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith(
        'id, username, profile_visibility, total_solves, pb_single, pb_single_date, pb_single_scramble, pb_ao5, pb_ao5_date, pb_ao12, pb_ao12_date, created_at, updated_at'
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(mockSingle).toHaveBeenCalledOnce();
    });

    it('should throw "Unauthorized" when no user session exists', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as never);

      await expect(getCurrentUserProfile()).rejects.toThrow('Unauthorized');
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should throw authentication error when auth.getUser fails', async () => {
      const mockAuthError = {
        message: 'Invalid token',
        name: 'AuthError',
        status: 401,
      } as AuthError;

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      } as never);

      await expect(getCurrentUserProfile()).rejects.toThrow('Authentication error: Invalid token');
    });

    it('should throw "Profile not found" when profile does not exist', async () => {
      const mockUser = { id: 'user-456', email: 'newuser@example.com' } as User;

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock PGRST116 error (no rows returned)
      const mockError = { code: 'PGRST116', message: 'No rows found' };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        single: mockSingle,
      } as ReturnType<typeof supabase.from>);

      await expect(getCurrentUserProfile()).rejects.toThrow('Profile not found');
    });

    it('should throw "Profile not found" when data is null without error code', async () => {
      const mockUser = { id: 'user-789', email: 'user@example.com' } as User;

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        single: mockSingle,
      } as ReturnType<typeof supabase.from>);

      await expect(getCurrentUserProfile()).rejects.toThrow('Profile not found');
    });

    it('should throw database error when query fails with non-PGRST116 error', async () => {
      const mockUser = { id: 'user-999', email: 'error@example.com' } as User;

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDatabaseError = {
        code: '42P01',
        message: 'relation "profiles" does not exist',
        details: 'Database table missing',
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockDatabaseError });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        single: mockSingle,
      } as ReturnType<typeof supabase.from>);

      await expect(getCurrentUserProfile()).rejects.toMatchObject({
        code: '42P01',
        message: 'relation "profiles" does not exist',
      });
    });

    it('should exclude deleted_at from returned profile', async () => {
      const mockUser = { id: 'user-555', email: 'active@example.com' } as User;
      const mockProfile: ProfileDTO = {
        id: 'user-555',
        username: 'activeuser',
        profile_visibility: false,
        total_solves: 50,
        pb_single: null,
        pb_single_date: null,
        pb_single_scramble: null,
        pb_ao5: null,
        pb_ao5_date: null,
        pb_ao12: null,
        pb_ao12_date: null,
        created_at: '2025-01-20T00:00:00Z',
        updated_at: '2025-01-20T00:00:00Z',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        single: mockSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await getCurrentUserProfile();

      expect(result).toEqual(mockProfile);
      expect(result).not.toHaveProperty('deleted_at');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  describe('checkUsernameAvailability', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true when username is available', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await checkUsernameAvailability('available_username');

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('username');
      expect(mockEq).toHaveBeenCalledWith('username', 'available_username');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(mockMaybeSingle).toHaveBeenCalledOnce();
    });

    it('should return false when username is already taken', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { username: 'taken_username' },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await checkUsernameAvailability('taken_username');

      expect(result).toBe(false);
      expect(mockEq).toHaveBeenCalledWith('username', 'taken_username');
    });

    it('should return false when database error occurs (safety)', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = {
        code: '42P01',
        message: 'Database connection error',
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await checkUsernameAvailability('any_username');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error checking username availability:',
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return true when PGRST116 error occurs (no rows found)', async () => {
      const mockError = {
        code: 'PGRST116',
        message: 'No rows found',
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await checkUsernameAvailability('available_username');

      expect(result).toBe(true);
    });

    it('should handle special characters in username', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      const result = await checkUsernameAvailability('user_name-123');

      expect(result).toBe(true);
      expect(mockEq).toHaveBeenCalledWith('username', 'user_name-123');
    });

    it('should exclude soft-deleted profiles from availability check', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      await checkUsernameAvailability('deleted_user');

      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  describe('updateUsername', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should successfully update username when it is available', async () => {
      // Mock checkUsernameAvailability to return true
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock update operation
      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          is: mockIs,
          maybeSingle: mockMaybeSingle,
        } as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        } as ReturnType<typeof supabase.from>);

      await expect(updateUsername('user-123', 'new_username')).resolves.toBeUndefined();

      // Verify availability was checked
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockEq).toHaveBeenCalledWith('username', 'new_username');

      // Verify update was performed
      expect(mockUpdate).toHaveBeenCalledWith({ username: 'new_username' });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should throw error when username is already taken', async () => {
      // Mock checkUsernameAvailability to return false
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { username: 'taken_username' },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        is: mockIs,
        maybeSingle: mockMaybeSingle,
      } as ReturnType<typeof supabase.from>);

      await expect(updateUsername('user-456', 'taken_username')).rejects.toThrow(
        'Username is already taken'
      );

      // Verify update was not called
      expect(mockSelect).toHaveBeenCalledWith('username');
    });

    it('should throw database error when update fails', async () => {
      // Mock checkUsernameAvailability to return true
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      // Mock update operation to fail
      const mockUpdate = vi.fn().mockReturnThis();
      const mockError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      };
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: mockError });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          is: mockIs,
          maybeSingle: mockMaybeSingle,
        } as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        } as ReturnType<typeof supabase.from>);

      await expect(updateUsername('user-789', 'some_username')).rejects.toMatchObject({
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      });
    });

    it('should handle updating to same username (edge case)', async () => {
      // Mock checkUsernameAvailability to return true (no other user has it)
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          is: mockIs,
          maybeSingle: mockMaybeSingle,
        } as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        } as ReturnType<typeof supabase.from>);

      await expect(updateUsername('user-999', 'current_username')).resolves.toBeUndefined();

      expect(mockUpdate).toHaveBeenCalledWith({ username: 'current_username' });
    });

    it('should properly chain availability check and update', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          is: mockIs,
          maybeSingle: mockMaybeSingle,
        } as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        } as ReturnType<typeof supabase.from>);

      await updateUsername('user-111', 'verified_username');

      // Verify the full chain was called in correct order
      expect(supabase.from).toHaveBeenCalledTimes(2);
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'profiles');
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'profiles');
    });

    it('should handle username with various valid characters', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIs = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

      const mockUpdate = vi.fn().mockReturnThis();
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          is: mockIs,
          maybeSingle: mockMaybeSingle,
        } as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockUpdateEq,
        } as ReturnType<typeof supabase.from>);

      await updateUsername('user-222', 'user_name-123');

      expect(mockUpdate).toHaveBeenCalledWith({ username: 'user_name-123' });
    });
  });
});
