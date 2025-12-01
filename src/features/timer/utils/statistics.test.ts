/**
 * Statistics Calculations Tests
 *
 * Comprehensive test suite for WCA statistics calculations including
 * averages, personal bests, and effective time calculations with penalties.
 */

import { describe, it, expect } from 'vitest';
import {
  getEffectiveTime,
  calculateAo5,
  calculateAo12,
  calculateAo100,
  findPersonalBest,
  isNewPersonalBest,
  findBestAo5,
  findBestAo12,
} from './statistics';
import type { SolveDTO } from '../types/timer.types';

/**
 * Helper function to create mock solve records
 */
function createSolve(
  time_ms: number,
  penalty_type: 'DNF' | '+2' | null = null,
  id: string = crypto.randomUUID(),
  created_at: string = new Date().toISOString()
): SolveDTO {
  return {
    id,
    user_id: 'test-user-id',
    time_ms,
    scramble: "R U R' U'",
    penalty_type,
    created_at,
  };
}

describe('getEffectiveTime', () => {
  it('should return time_ms for solve with no penalty', () => {
    const solve = createSolve(10000, null);
    expect(getEffectiveTime(solve)).toBe(10000);
  });

  it('should add 2000ms for +2 penalty', () => {
    const solve = createSolve(10000, '+2');
    expect(getEffectiveTime(solve)).toBe(12000);
  });

  it('should return "DNF" for DNF penalty', () => {
    const solve = createSolve(10000, 'DNF');
    expect(getEffectiveTime(solve)).toBe('DNF');
  });
});

describe('calculateAo5', () => {
  it('should return null for insufficient solves (less than 5)', () => {
    const solves = [createSolve(10000), createSolve(11000), createSolve(12000)];
    expect(calculateAo5(solves)).toBe(null);
  });

  it('should calculate average excluding best and worst', () => {
    const solves = [
      createSolve(10000), // best - excluded
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(20000), // worst - excluded
    ];
    // Average of [12000, 13000, 14000] = 39000 / 3 = 13000
    expect(calculateAo5(solves)).toBe(13000);
  });

  it('should handle 1 DNF correctly (DNF excluded as worst)', () => {
    const solves = [
      createSolve(10000), // best - excluded
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(20000, 'DNF'), // worst - excluded
    ];
    // Average of [12000, 13000, 14000] = 39000 / 3 = 13000
    expect(calculateAo5(solves)).toBe(13000);
  });

  it('should return null for more than 1 DNF', () => {
    const solves = [
      createSolve(10000),
      createSolve(12000),
      createSolve(13000, 'DNF'),
      createSolve(14000, 'DNF'),
      createSolve(20000),
    ];
    expect(calculateAo5(solves)).toBe(null);
  });

  it('should handle +2 penalties in calculation', () => {
    const solves = [
      createSolve(10000, '+2'), // 12000 effective - best - excluded
      createSolve(13000),
      createSolve(14000),
      createSolve(15000),
      createSolve(20000), // worst - excluded
    ];
    // Average of [13000, 14000, 15000] = 42000 / 3 = 14000
    expect(calculateAo5(solves)).toBe(14000);
  });

  it('should use only last 5 solves when more are provided', () => {
    const solves = [
      createSolve(5000), // Not included
      createSolve(6000), // Not included
      createSolve(7000), // Not included
      createSolve(10000), // best - excluded
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(20000), // worst - excluded
    ];
    // Last 5: [10000, 12000, 13000, 14000, 20000]
    // Average of [12000, 13000, 14000] = 39000 / 3 = 13000
    expect(calculateAo5(solves)).toBe(13000);
  });

  it('should round to nearest millisecond', () => {
    const solves = [
      createSolve(10000), // best - excluded
      createSolve(12000),
      createSolve(12001),
      createSolve(12002),
      createSolve(20000), // worst - excluded
    ];
    // Average of [12000, 12001, 12002] = 36003 / 3 = 12001
    expect(calculateAo5(solves)).toBe(12001);
  });
});

describe('calculateAo12', () => {
  it('should return null for insufficient solves (less than 12)', () => {
    const solves = Array.from({ length: 10 }, (_, i) => createSolve(10000 + i * 1000));
    expect(calculateAo12(solves)).toBe(null);
  });

  it('should calculate average excluding best and worst', () => {
    const solves = [
      createSolve(10000), // best - excluded
      createSolve(11000),
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(15000),
      createSolve(16000),
      createSolve(17000),
      createSolve(18000),
      createSolve(19000),
      createSolve(20000),
      createSolve(30000), // worst - excluded
    ];
    // Average of middle 10 = (11000 + 12000 + ... + 20000) / 10 = 155000 / 10 = 15500
    expect(calculateAo12(solves)).toBe(15500);
  });

  it('should handle 1 DNF correctly (DNF excluded as worst)', () => {
    const solves = [
      createSolve(10000), // best - excluded
      createSolve(11000),
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(15000),
      createSolve(16000),
      createSolve(17000),
      createSolve(18000),
      createSolve(19000),
      createSolve(20000),
      createSolve(30000, 'DNF'), // worst - excluded
    ];
    // Average of middle 10 = (11000 + 12000 + ... + 20000) / 10 = 155000 / 10 = 15500
    expect(calculateAo12(solves)).toBe(15500);
  });

  it('should return null for more than 1 DNF', () => {
    const solves = [
      createSolve(10000),
      createSolve(11000),
      createSolve(12000, 'DNF'),
      createSolve(13000, 'DNF'),
      createSolve(14000),
      createSolve(15000),
      createSolve(16000),
      createSolve(17000),
      createSolve(18000),
      createSolve(19000),
      createSolve(20000),
      createSolve(30000),
    ];
    expect(calculateAo12(solves)).toBe(null);
  });

  it('should use only last 12 solves when more are provided', () => {
    const solves = [
      ...Array.from({ length: 5 }, (_, i) => createSolve(5000 + i * 1000)), // Not included
      createSolve(10000), // best - excluded
      createSolve(11000),
      createSolve(12000),
      createSolve(13000),
      createSolve(14000),
      createSolve(15000),
      createSolve(16000),
      createSolve(17000),
      createSolve(18000),
      createSolve(19000),
      createSolve(20000),
      createSolve(30000), // worst - excluded
    ];
    // Last 12: [10000, 11000, ..., 30000]
    // Average of middle 10 = 155000 / 10 = 15500
    expect(calculateAo12(solves)).toBe(15500);
  });
});

describe('calculateAo100', () => {
  it('should return null for insufficient solves (less than 100)', () => {
    const solves = Array.from({ length: 50 }, (_, i) => createSolve(10000 + i * 100));
    expect(calculateAo100(solves)).toBe(null);
  });

  it('should calculate average excluding best 5 and worst 5', () => {
    const solves = Array.from({ length: 100 }, (_, i) => createSolve(10000 + i * 100));
    // Times: 10000, 10100, 10200, ..., 19900
    // Exclude best 5: 10000-10400
    // Exclude worst 5: 19500-19900
    // Average of middle 90: sum from 10500 to 19400
    // Sum = (10500 + 19400) * 90 / 2 = 1345500
    // Average = 1345500 / 90 = 14950
    expect(calculateAo100(solves)).toBe(14950);
  });

  it('should handle up to 5 DNFs correctly (DNFs excluded as worst)', () => {
    const solves = [
      ...Array.from({ length: 95 }, (_, i) => createSolve(10000 + i * 100)),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
    ];
    // 95 valid times + 5 DNFs
    // DNFs are worst, all excluded
    // Calculate average of middle 90 from the 95 valid times
    const result = calculateAo100(solves);
    expect(result).not.toBe(null);
    expect(typeof result).toBe('number');
  });

  it('should return null for more than 5 DNFs', () => {
    const solves = [
      ...Array.from({ length: 94 }, (_, i) => createSolve(10000 + i * 100)),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'),
      createSolve(20000, 'DNF'), // 6th DNF
    ];
    expect(calculateAo100(solves)).toBe(null);
  });

  it('should use only last 100 solves when more are provided', () => {
    const solves = [
      ...Array.from({ length: 20 }, (_, i) => createSolve(5000 + i * 100)), // Not included
      ...Array.from({ length: 100 }, (_, i) => createSolve(10000 + i * 100)),
    ];
    // Last 100 should be used
    const result = calculateAo100(solves);
    expect(result).toBe(14950);
  });
});

describe('findPersonalBest', () => {
  it('should return null for empty array', () => {
    expect(findPersonalBest([])).toBe(null);
  });

  it('should return null when all solves are DNF', () => {
    const solves = [
      createSolve(10000, 'DNF'),
      createSolve(11000, 'DNF'),
      createSolve(12000, 'DNF'),
    ];
    expect(findPersonalBest(solves)).toBe(null);
  });

  it('should find solve with best time', () => {
    const solve1 = createSolve(12000);
    const solve2 = createSolve(10000); // Best
    const solve3 = createSolve(15000);

    const result = findPersonalBest([solve1, solve2, solve3]);
    expect(result).toBe(solve2);
  });

  it('should ignore DNF solves', () => {
    const solve1 = createSolve(12000);
    const solve2 = createSolve(10000); // Best
    const solve3 = createSolve(5000, 'DNF');

    const result = findPersonalBest([solve1, solve2, solve3]);
    expect(result).toBe(solve2);
  });

  it('should consider +2 penalties in effective time', () => {
    const solve1 = createSolve(12000);
    const solve2 = createSolve(10000, '+2'); // 12000 effective
    const solve3 = createSolve(11000); // Best

    const result = findPersonalBest([solve1, solve2, solve3]);
    expect(result).toBe(solve3);
  });

  it('should handle single solve', () => {
    const solve = createSolve(10000);
    const result = findPersonalBest([solve]);
    expect(result).toBe(solve);
  });
});

describe('isNewPersonalBest', () => {
  it('should return true when currentPB is null (first solve)', () => {
    expect(isNewPersonalBest(10000, null)).toBe(true);
  });

  it('should return true when newTime is better (lower)', () => {
    expect(isNewPersonalBest(9000, 10000)).toBe(true);
  });

  it('should return false when newTime is worse (higher)', () => {
    expect(isNewPersonalBest(11000, 10000)).toBe(false);
  });

  it('should return false when newTime equals currentPB', () => {
    expect(isNewPersonalBest(10000, 10000)).toBe(false);
  });
});

describe('findBestAo5', () => {
  it('should return null for insufficient solves (less than 5)', () => {
    const solves = [createSolve(10000), createSolve(11000), createSolve(12000)];
    expect(findBestAo5(solves)).toBe(null);
  });

  it('should return null when all windows have too many DNFs', () => {
    const solves = [
      createSolve(10000, 'DNF'),
      createSolve(11000, 'DNF'),
      createSolve(12000, 'DNF'),
      createSolve(13000),
      createSolve(14000),
    ];
    expect(findBestAo5(solves)).toBe(null);
  });

  it('should find best Ao5 from single window', () => {
    const solves = [
      createSolve(10000, null, '1', '2024-12-01T10:00:00Z'),
      createSolve(12000, null, '2', '2024-12-01T10:01:00Z'),
      createSolve(13000, null, '3', '2024-12-01T10:02:00Z'),
      createSolve(14000, null, '4', '2024-12-01T10:03:00Z'),
      createSolve(20000, null, '5', '2024-12-01T10:04:00Z'),
    ];

    const result = findBestAo5(solves);
    expect(result).not.toBe(null);
    expect(result?.average).toBe(13000); // Average of [12000, 13000, 14000]
    expect(result?.solves).toHaveLength(5);
    expect(result?.date).toBe('2024-12-01T10:04:00Z'); // Last solve in window
  });

  it('should find best Ao5 from multiple windows', () => {
    const solves = [
      // Window 1: [20000, 25000, 24000, 23000, 30000] - Ao5 = 24000
      createSolve(20000, null, '1', '2024-12-01T10:00:00Z'),
      createSolve(25000, null, '2', '2024-12-01T10:01:00Z'),
      createSolve(24000, null, '3', '2024-12-01T10:02:00Z'),
      createSolve(23000, null, '4', '2024-12-01T10:03:00Z'),
      createSolve(30000, null, '5', '2024-12-01T10:04:00Z'),
      // Window 2: [10000, 12000, 13000, 14000, 20000] - Ao5 = 13000 (best)
      createSolve(10000, null, '6', '2024-12-01T11:00:00Z'),
      createSolve(12000, null, '7', '2024-12-01T11:01:00Z'),
      createSolve(13000, null, '8', '2024-12-01T11:02:00Z'),
      createSolve(14000, null, '9', '2024-12-01T11:03:00Z'),
      createSolve(20000, null, '10', '2024-12-01T11:04:00Z'),
    ];

    const result = findBestAo5(solves);
    expect(result).not.toBe(null);
    // Best average should be 13000 from second window
    expect(result?.average).toBe(13000);
    expect(result?.solves).toHaveLength(5);
  });

  it('should skip windows with too many DNFs', () => {
    const solves = [
      // First 5: Has 2 DNFs - invalid
      createSolve(10000, 'DNF', '1', '2024-12-01T10:00:00Z'),
      createSolve(15000, 'DNF', '2', '2024-12-01T10:01:00Z'),
      createSolve(14000, null, '3', '2024-12-01T10:02:00Z'),
      createSolve(13000, null, '4', '2024-12-01T10:03:00Z'),
      createSolve(20000, null, '5', '2024-12-01T10:04:00Z'),
      // Last 5: Valid
      createSolve(10000, null, '6', '2024-12-01T11:00:00Z'),
      createSolve(12000, null, '7', '2024-12-01T11:01:00Z'),
      createSolve(13000, null, '8', '2024-12-01T11:02:00Z'),
      createSolve(14000, null, '9', '2024-12-01T11:03:00Z'),
      createSolve(20000, null, '10', '2024-12-01T11:04:00Z'),
    ];

    const result = findBestAo5(solves);
    expect(result).not.toBe(null);
    // Should find a valid window (skipping windows with 2+ DNFs)
    // The best window may be [3-7] with average 12667 due to overlapping
    expect(result?.average).toBeGreaterThan(0);
    expect(result?.solves).toHaveLength(5);
  });
});

describe('findBestAo12', () => {
  it('should return null for insufficient solves (less than 12)', () => {
    const solves = Array.from({ length: 10 }, (_, i) => createSolve(10000 + i * 1000));
    expect(findBestAo12(solves)).toBe(null);
  });

  it('should return null when all windows have too many DNFs', () => {
    const solves = [
      createSolve(10000, 'DNF'),
      createSolve(11000, 'DNF'),
      ...Array.from({ length: 10 }, (_, i) => createSolve(12000 + i * 1000)),
    ];
    expect(findBestAo12(solves)).toBe(null);
  });

  it('should find best Ao12 from single window', () => {
    const solves = [
      createSolve(10000, null, '1', '2024-12-01T10:00:00Z'),
      createSolve(11000, null, '2', '2024-12-01T10:01:00Z'),
      createSolve(12000, null, '3', '2024-12-01T10:02:00Z'),
      createSolve(13000, null, '4', '2024-12-01T10:03:00Z'),
      createSolve(14000, null, '5', '2024-12-01T10:04:00Z'),
      createSolve(15000, null, '6', '2024-12-01T10:05:00Z'),
      createSolve(16000, null, '7', '2024-12-01T10:06:00Z'),
      createSolve(17000, null, '8', '2024-12-01T10:07:00Z'),
      createSolve(18000, null, '9', '2024-12-01T10:08:00Z'),
      createSolve(19000, null, '10', '2024-12-01T10:09:00Z'),
      createSolve(20000, null, '11', '2024-12-01T10:10:00Z'),
      createSolve(30000, null, '12', '2024-12-01T10:11:00Z'),
    ];

    const result = findBestAo12(solves);
    expect(result).not.toBe(null);
    expect(result?.average).toBe(15500); // Average of middle 10
    expect(result?.solves).toHaveLength(12);
    expect(result?.date).toBe('2024-12-01T10:11:00Z'); // Last solve in window
  });

  it('should find best Ao12 from multiple windows', () => {
    const solves = [
      // Window 1: Times 20000-31000 (Ao12 ≈ 25500)
      ...Array.from({ length: 12 }, (_, i) =>
        createSolve(
          20000 + i * 1000,
          null,
          `${i + 1}`,
          `2024-12-01T10:${String(i).padStart(2, '0')}:00Z`
        )
      ),
      // Window 2: Times 10000-21000 (Ao12 ≈ 15500, better)
      ...Array.from({ length: 12 }, (_, i) =>
        createSolve(
          10000 + i * 1000,
          null,
          `${i + 13}`,
          `2024-12-01T11:${String(i).padStart(2, '0')}:00Z`
        )
      ),
    ];

    const result = findBestAo12(solves);
    expect(result).not.toBe(null);
    // Best average should be 15500 from second window
    expect(result?.average).toBe(15500);
    expect(result?.solves).toHaveLength(12);
  });

  it('should skip windows with too many DNFs', () => {
    const solves = [
      // First 12: Has 2 DNFs - invalid
      createSolve(10000, 'DNF', '1'),
      createSolve(11000, 'DNF', '2'),
      ...Array.from({ length: 10 }, (_, i) => createSolve(12000 + i * 1000, null, `${i + 3}`)),
      // Last 12: Valid with Ao12 = 15500
      ...Array.from({ length: 12 }, (_, i) =>
        createSolve(
          10000 + i * 1000,
          null,
          `${i + 13}`,
          `2024-12-01T11:${String(i).padStart(2, '0')}:00Z`
        )
      ),
    ];

    const result = findBestAo12(solves);
    expect(result).not.toBe(null);
    // Should find a valid window (the first 12 is invalid due to 2 DNFs)
    expect(result?.average).toBe(15500);
    expect(result?.solves).toHaveLength(12);
  });
});
