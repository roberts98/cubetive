import type { PenaltyType } from '../../types';

/**
 * Formats time in milliseconds to user-friendly format (seconds.hundredths)
 *
 * @param timeMs - Time in milliseconds
 * @param penaltyType - Optional penalty type (null, '+2', 'DNF')
 * @returns Formatted time string (e.g., "12.34s", "12.34s (+2)", "DNF")
 *
 * @example
 * formatTime(12345) // "12.34s"
 * formatTime(12345, '+2') // "12.34s (+2)"
 * formatTime(12345, 'DNF') // "DNF"
 * formatTime(null) // "N/A"
 */
export function formatTime(timeMs: number | null, penaltyType?: PenaltyType): string {
  if (timeMs === null) return 'N/A';

  if (penaltyType === 'DNF') {
    return 'DNF';
  }

  const totalSeconds = timeMs / 1000;
  const seconds = Math.floor(totalSeconds);
  const hundredths = Math.floor((totalSeconds - seconds) * 100);
  const timeString = `${seconds}.${hundredths.toString().padStart(2, '0')}s`;

  if (penaltyType === '+2') {
    return `${timeString} (+2)`;
  }

  return timeString;
}

/**
 * Formats date to readable long format
 *
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 15, 2025")
 *
 * @example
 * formatDate("2025-01-15T10:30:00Z") // "January 15, 2025"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats date to readable short format
 *
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 *
 * @example
 * formatDateShort("2025-01-15T10:30:00Z") // "Jan 15, 2025"
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats time of day to readable format
 *
 * @param dateString - ISO date string
 * @returns Formatted time string (e.g., "10:30 AM")
 *
 * @example
 * formatTimeOfDay("2025-01-15T10:30:00Z") // "10:30 AM"
 */
export function formatTimeOfDay(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generates a profile URL for a given username
 *
 * @param username - Username to generate URL for
 * @param origin - Optional origin (defaults to window.location.origin)
 * @returns Full profile URL
 *
 * @example
 * getProfileUrl("john_doe") // "https://cubetive.com/profile/john_doe"
 */
export function getProfileUrl(username: string, origin?: string): string {
  const baseOrigin = origin || window.location.origin;
  return `${baseOrigin}/profile/${username}`;
}
