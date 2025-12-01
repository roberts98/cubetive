/**
 * Tests for Solves Service
 *
 * Tests CRUD operations for solve records
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../../db/supabase';
import {
  saveSolve,
  getUserSolves,
  getRecentSolves,
  deleteSolve,
  updateSolvePenalty,
  getSolveCount,
  getAllSolves,
} from './solvesService';
import type { SolveDTO } from '../types/timer.types';

// Mock Supabase
vi.mock('../../../db/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('solvesService', () => {
  const mockUserId = 'user-123';
  const mockUser = { id: mockUserId, email: 'test@example.com' };

  const mockSolve: SolveDTO = {
    id: 'solve-123',
    user_id: mockUserId,
    time_ms: 12450,
    scramble: "R U R' U' F",
    penalty_type: null,
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveSolve', () => {
    it('should save a solve successfully', async () => {
      // Mock successful authentication
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      // Mock successful insert
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSolve,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await saveSolve({
        user_id: mockUserId,
        time_ms: 12450,
        scramble: "R U R' U' F",
        penalty_type: null,
      });

      expect(result).toEqual(mockSolve);
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('solves');
    });

    it('should throw error if user is not authenticated', async () => {
      // Mock authentication failure
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as never);

      await expect(
        saveSolve({
          user_id: mockUserId,
          time_ms: 12450,
          scramble: "R U R' U' F",
          penalty_type: null,
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should save solve with +2 penalty', async () => {
      // Mock successful authentication
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as never);

      const solveWith2 = { ...mockSolve, penalty_type: '+2' as const };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: solveWith2,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await saveSolve({
        user_id: mockUserId,
        time_ms: 12450,
        scramble: "R U R' U' F",
        penalty_type: '+2',
      });

      expect(result.penalty_type).toBe('+2');
    });
  });

  describe('getUserSolves', () => {
    it('should fetch user solves with pagination', async () => {
      const mockSolves = [mockSolve];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: mockSolves,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getUserSolves(mockUserId, 50, 0);

      expect(result).toEqual(mockSolves);
      expect(supabase.from).toHaveBeenCalledWith('solves');
    });

    it('should return empty array if no solves', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getUserSolves(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getRecentSolves', () => {
    it('should fetch recent solves', async () => {
      const mockSolves = [mockSolve];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockSolves,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getRecentSolves(mockUserId, 5);

      expect(result).toEqual(mockSolves);
    });
  });

  describe('deleteSolve', () => {
    it('should soft delete a solve', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      await deleteSolve('solve-123');

      expect(supabase.from).toHaveBeenCalledWith('solves');
    });
  });

  describe('updateSolvePenalty', () => {
    it('should update penalty to +2', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      await updateSolvePenalty('solve-123', { penalty_type: '+2' });

      expect(supabase.from).toHaveBeenCalledWith('solves');
    });

    it('should update penalty to DNF', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      await updateSolvePenalty('solve-123', { penalty_type: 'DNF' });

      expect(supabase.from).toHaveBeenCalledWith('solves');
    });

    it('should remove penalty', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      await updateSolvePenalty('solve-123', { penalty_type: null });

      expect(supabase.from).toHaveBeenCalledWith('solves');
    });
  });

  describe('getSolveCount', () => {
    it('should return total solve count', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              count: 42,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getSolveCount(mockUserId);

      expect(result).toBe(42);
    });

    it('should return 0 if no solves', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              count: null,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getSolveCount(mockUserId);

      expect(result).toBe(0);
    });
  });

  describe('getAllSolves', () => {
    it('should fetch all solves in chronological order', async () => {
      const mockSolves: SolveDTO[] = [
        { ...mockSolve, id: 'solve-1', created_at: '2024-01-01T00:00:00Z' },
        { ...mockSolve, id: 'solve-2', created_at: '2024-01-02T00:00:00Z' },
        { ...mockSolve, id: 'solve-3', created_at: '2024-01-03T00:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockSolves,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getAllSolves(mockUserId);

      expect(result).toEqual(mockSolves);
      expect(supabase.from).toHaveBeenCalledWith('solves');
    });

    it('should return empty array if no solves', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      const result = await getAllSolves(mockUserId);

      expect(result).toEqual([]);
    });

    it('should throw error on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database error'),
                }),
              }),
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as never);

      await expect(getAllSolves(mockUserId)).rejects.toThrow('Database error');
    });
  });
});
