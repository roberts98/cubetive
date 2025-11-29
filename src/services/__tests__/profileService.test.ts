import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUserProfile } from '../profileService';
import { supabase } from '../../db/supabase';
import type { ProfileDTO } from '../../types';
import type { User, AuthError } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('../../db/supabase', () => ({
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
      const mockAuthError = { message: 'Invalid token', name: 'AuthError', status: 401 } as AuthError;

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
});
