/**
 * Time formatting utilities for displaying solve times
 */

import type { PenaltyType } from '../types/timer.types';

/**
 * Formats milliseconds to a human-readable time string
 *
 * @param timeMs - Time in milliseconds
 * @returns Formatted time string (e.g., "12.45")
 *
 * @example
 * formatTime(12450) // "12.45"
 * formatTime(125340) // "2:05.34"
 */
export function formatTime(timeMs: number): string {
  const totalSeconds = timeMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }

  return seconds.toFixed(2);
}

/**
 * Formats a solve time with penalty indicator
 *
 * @param timeMs - Time in milliseconds
 * @param penaltyType - Penalty type ('+2', 'DNF', or null)
 * @returns Formatted time string with penalty indicator
 *
 * @example
 * formatSolveTime(12450, null) // "12.45"
 * formatSolveTime(12450, '+2') // "14.45 (+2)"
 * formatSolveTime(12450, 'DNF') // "DNF (12.45)"
 */
export function formatSolveTime(timeMs: number, penaltyType: PenaltyType): string {
  if (penaltyType === 'DNF') {
    return `DNF (${formatTime(timeMs)})`;
  }

  if (penaltyType === '+2') {
    const penalizedTime = timeMs + 2000;
    return `${formatTime(penalizedTime)} (+2)`;
  }

  return formatTime(timeMs);
}

/**
 * Gets the effective time in milliseconds including penalties
 *
 * @param timeMs - Time in milliseconds
 * @param penaltyType - Penalty type ('+2', 'DNF', or null)
 * @returns Effective time in milliseconds
 *
 * @example
 * getEffectiveTime(12450, null) // 12450
 * getEffectiveTime(12450, '+2') // 14450
 * getEffectiveTime(12450, 'DNF') // Infinity
 */
export function getEffectiveTime(timeMs: number, penaltyType: PenaltyType): number {
  if (penaltyType === 'DNF') {
    return Infinity;
  }

  if (penaltyType === '+2') {
    return timeMs + 2000;
  }

  return timeMs;
}
