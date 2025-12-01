/**
 * Timer Store
 *
 * Zustand store for managing timer state across the application.
 * Handles timer state transitions, elapsed time tracking, and scramble management.
 */

import { create } from 'zustand';
import type { TimerState } from '../types/timer.types';

interface TimerStore {
  // State
  state: TimerState;
  elapsedTime: number;
  startTime: number | null;
  currentScramble: string;
  lastSolveTime: number | null;

  // Actions
  setState: (state: TimerState) => void;
  setElapsedTime: (time: number) => void;
  setStartTime: (time: number | null) => void;
  setCurrentScramble: (scramble: string) => void;
  setLastSolveTime: (time: number | null) => void;
  reset: () => void;
}

/**
 * Initial state for the timer
 */
const initialState = {
  state: 'idle' as TimerState,
  elapsedTime: 0,
  startTime: null,
  currentScramble: '',
  lastSolveTime: null,
};

/**
 * Timer store with state and actions
 */
export const useTimerStore = create<TimerStore>((set) => ({
  ...initialState,

  setState: (state) => set({ state }),

  setElapsedTime: (time) => set({ elapsedTime: time }),

  setStartTime: (time) => set({ startTime: time }),

  setCurrentScramble: (scramble) => set({ currentScramble: scramble }),

  setLastSolveTime: (time) => set({ lastSolveTime: time }),

  reset: () => set(initialState),
}));
