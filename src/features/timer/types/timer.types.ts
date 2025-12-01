/**
 * Timer Types and Interfaces
 *
 * Type definitions for the timer feature including solve records,
 * timer states, and session statistics.
 */

/**
 * Penalty types that can be applied to a solve
 */
export type PenaltyType = '+2' | 'DNF' | null;

/**
 * Timer states during operation
 */
export type TimerState = 'idle' | 'ready' | 'running' | 'stopped';

/**
 * Solve record from database
 */
export interface SolveDTO {
  id: string;
  user_id: string;
  time_ms: number;
  scramble: string;
  penalty_type: PenaltyType;
  created_at: string;
}

/**
 * Data required to create a new solve
 */
export interface CreateSolveData {
  user_id: string;
  time_ms: number;
  scramble: string;
  penalty_type: PenaltyType;
}

/**
 * Data required to update a solve's penalty
 */
export interface UpdateSolvePenaltyData {
  penalty_type: PenaltyType;
}

/**
 * Session statistics calculated from recent solves
 */
export interface SessionStats {
  currentAo5: number | null;
  currentAo12: number | null;
  sessionBest: number | null;
  sessionWorst: number | null;
  totalSolves: number;
}

/**
 * Timer state for Zustand store
 */
export interface TimerStateData {
  state: TimerState;
  elapsedTime: number;
  startTime: number | null;
  currentScramble: string;
}

/**
 * Result of finding best average (Ao5, Ao12, etc.)
 */
export interface AverageResult {
  average: number;
  solves: SolveDTO[];
  date: string;
}
