/**
 * Statistics Calculations Module
 *
 * Implements WCA (World Cube Association) standard statistics calculations
 * for speedcubing, including averages, personal bests, and effective times
 * with penalty handling.
 *
 * Business Rules:
 * - DNF counts as worst time in averages
 * - More than 1 DNF in Ao5 = DNF average (null)
 * - More than 1 DNF in Ao12 = DNF average (null)
 * - More than 5 DNFs in Ao100 = DNF average (null)
 * - +2 penalty adds 2000ms to time_ms
 * - Ao5: Use last 5 solves, exclude best and worst
 * - Ao12: Use last 12 solves, exclude best and worst
 * - Ao100: Use last 100 solves, exclude best 5 and worst 5
 */

import type { SolveDTO, AverageResult } from '../types/timer.types';

/**
 * Get effective time considering penalties
 *
 * @param solve - The solve record
 * @returns Effective time in milliseconds, or 'DNF' for DNF solves
 *
 * @example
 * getEffectiveTime({ time_ms: 10000, penalty_type: null }) // 10000
 * getEffectiveTime({ time_ms: 10000, penalty_type: '+2' }) // 12000
 * getEffectiveTime({ time_ms: 10000, penalty_type: 'DNF' }) // 'DNF'
 */
export function getEffectiveTime(solve: SolveDTO): number | 'DNF' {
  if (solve.penalty_type === 'DNF') {
    return 'DNF';
  }

  if (solve.penalty_type === '+2') {
    return solve.time_ms + 2000;
  }

  return solve.time_ms;
}

/**
 * Calculate average excluding specified number of best and worst times
 *
 * @param solves - Array of solve records
 * @param required - Minimum number of solves required
 * @param excludeCount - Number of best and worst solves to exclude
 * @param maxDNFs - Maximum allowed DNFs before returning null
 * @returns Average time in milliseconds, or null if cannot be calculated
 */
function calculateAverage(
  solves: SolveDTO[],
  required: number,
  excludeCount: number,
  maxDNFs: number
): number | null {
  // Not enough solves
  if (solves.length < required) {
    return null;
  }

  // Take last N solves
  const lastSolves = solves.slice(-required);

  // Get effective times
  const times = lastSolves.map(getEffectiveTime);

  // Count DNFs
  const dnfCount = times.filter((time) => time === 'DNF').length;

  // Too many DNFs
  if (dnfCount > maxDNFs) {
    return null;
  }

  // Sort times (DNF goes to end)
  const sortedTimes = [...times].sort((a, b) => {
    if (a === 'DNF') return 1;
    if (b === 'DNF') return -1;
    return a - b;
  });

  // Exclude best and worst
  const trimmedTimes = sortedTimes.slice(excludeCount, -excludeCount);

  // Calculate average of remaining valid times
  const validTimes = trimmedTimes.filter((time): time is number => time !== 'DNF');

  // Should not happen if logic is correct, but safety check
  if (validTimes.length === 0) {
    return null;
  }

  const sum = validTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / validTimes.length);
}

/**
 * Calculate Average of 5 (Ao5)
 *
 * Uses last 5 solves, excludes best and worst, calculates average.
 * Returns null if less than 5 solves or more than 1 DNF.
 *
 * @param solves - Array of solve records (should be chronologically ordered)
 * @returns Average time in milliseconds, or null if cannot be calculated
 *
 * @example
 * calculateAo5([solve1, solve2, solve3, solve4, solve5]) // 12345
 * calculateAo5([solve1, solve2]) // null (insufficient solves)
 * calculateAo5([...solves with 2 DNFs]) // null (too many DNFs)
 */
export function calculateAo5(solves: SolveDTO[]): number | null {
  return calculateAverage(solves, 5, 1, 1);
}

/**
 * Calculate Average of 12 (Ao12)
 *
 * Uses last 12 solves, excludes best and worst, calculates average.
 * Returns null if less than 12 solves or more than 1 DNF.
 *
 * @param solves - Array of solve records (should be chronologically ordered)
 * @returns Average time in milliseconds, or null if cannot be calculated
 *
 * @example
 * calculateAo12([...12 solves]) // 11234
 * calculateAo12([...8 solves]) // null (insufficient solves)
 */
export function calculateAo12(solves: SolveDTO[]): number | null {
  return calculateAverage(solves, 12, 1, 1);
}

/**
 * Calculate Average of 100 (Ao100)
 *
 * Uses last 100 solves, excludes best 5 and worst 5, calculates average.
 * Returns null if less than 100 solves or more than 5 DNFs.
 *
 * @param solves - Array of solve records (should be chronologically ordered)
 * @returns Average time in milliseconds, or null if cannot be calculated
 *
 * @example
 * calculateAo100([...100 solves]) // 10987
 * calculateAo100([...50 solves]) // null (insufficient solves)
 */
export function calculateAo100(solves: SolveDTO[]): number | null {
  return calculateAverage(solves, 100, 5, 5);
}

/**
 * Find personal best single time (ignoring DNFs)
 *
 * @param solves - Array of solve records
 * @returns Solve with best time, or null if no valid solves
 *
 * @example
 * findPersonalBest([solve1, solve2, solve3]) // solve2 (if solve2 has best time)
 * findPersonalBest([]) // null
 * findPersonalBest([dnfSolve]) // null
 */
export function findPersonalBest(solves: SolveDTO[]): SolveDTO | null {
  if (solves.length === 0) {
    return null;
  }

  // Filter out DNF solves
  const validSolves = solves.filter((solve) => getEffectiveTime(solve) !== 'DNF');

  if (validSolves.length === 0) {
    return null;
  }

  // Find solve with minimum effective time
  return validSolves.reduce((best, current) => {
    const bestTime = getEffectiveTime(best);
    const currentTime = getEffectiveTime(current);

    // Type guards (should never be DNF due to filter, but TypeScript needs this)
    if (bestTime === 'DNF') return current;
    if (currentTime === 'DNF') return best;

    return currentTime < bestTime ? current : best;
  });
}

/**
 * Check if new time is a personal best
 *
 * @param newTime - New solve time in milliseconds
 * @param currentPB - Current personal best in milliseconds, or null if no PB
 * @returns true if newTime is better (lower) than currentPB
 *
 * @example
 * isNewPersonalBest(10000, 11000) // true
 * isNewPersonalBest(10000, 9000) // false
 * isNewPersonalBest(10000, null) // true (first solve)
 */
export function isNewPersonalBest(newTime: number, currentPB: number | null): boolean {
  if (currentPB === null) {
    return true;
  }

  return newTime < currentPB;
}

/**
 * Find best Average of 5 from all solve history
 *
 * Iterates through all possible windows of 5 consecutive solves,
 * calculates Ao5 for each, and returns the best one.
 *
 * @param solves - Array of solve records (should be chronologically ordered)
 * @returns Best Ao5 with average, solves, and date, or null if no valid Ao5
 *
 * @example
 * findBestAo5(allSolves)
 * // { average: 11234, solves: [...5 solves], date: '2024-12-01T10:30:00Z' }
 */
export function findBestAo5(solves: SolveDTO[]): AverageResult | null {
  if (solves.length < 5) {
    return null;
  }

  let bestAverage: number | null = null;
  let bestWindow: SolveDTO[] = [];
  let bestDate = '';

  // Iterate through all windows of 5 consecutive solves
  for (let i = 0; i <= solves.length - 5; i++) {
    const window = solves.slice(i, i + 5);
    const average = calculateAo5(window);

    // Skip invalid averages (too many DNFs)
    if (average === null) {
      continue;
    }

    // Update best if this is the first valid average or better than current best
    if (bestAverage === null || average < bestAverage) {
      bestAverage = average;
      bestWindow = window;
      bestDate = window[window.length - 1].created_at; // Last solve in window
    }
  }

  if (bestAverage === null) {
    return null;
  }

  return {
    average: bestAverage,
    solves: bestWindow,
    date: bestDate,
  };
}

/**
 * Find best Average of 12 from all solve history
 *
 * Iterates through all possible windows of 12 consecutive solves,
 * calculates Ao12 for each, and returns the best one.
 *
 * @param solves - Array of solve records (should be chronologically ordered)
 * @returns Best Ao12 with average, solves, and date, or null if no valid Ao12
 *
 * @example
 * findBestAo12(allSolves)
 * // { average: 10987, solves: [...12 solves], date: '2024-12-01T10:30:00Z' }
 */
export function findBestAo12(solves: SolveDTO[]): AverageResult | null {
  if (solves.length < 12) {
    return null;
  }

  let bestAverage: number | null = null;
  let bestWindow: SolveDTO[] = [];
  let bestDate = '';

  // Iterate through all windows of 12 consecutive solves
  for (let i = 0; i <= solves.length - 12; i++) {
    const window = solves.slice(i, i + 12);
    const average = calculateAo12(window);

    // Skip invalid averages (too many DNFs)
    if (average === null) {
      continue;
    }

    // Update best if this is the first valid average or better than current best
    if (bestAverage === null || average < bestAverage) {
      bestAverage = average;
      bestWindow = window;
      bestDate = window[window.length - 1].created_at; // Last solve in window
    }
  }

  if (bestAverage === null) {
    return null;
  }

  return {
    average: bestAverage,
    solves: bestWindow,
    date: bestDate,
  };
}
