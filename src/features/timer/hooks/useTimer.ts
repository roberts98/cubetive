/**
 * useTimer Hook
 *
 * Core timer logic following WCA (World Cube Association) standards.
 * Handles spacebar controls, timing precision, and state management.
 *
 * WCA Timer Rules:
 * 1. Press and hold spacebar for 0.5 seconds → ready state (green)
 * 2. Release spacebar → timer starts
 * 3. Press spacebar again → timer stops
 * 4. Time is recorded and solve is saved
 */

import { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useAuthStore } from '../../auth/stores/authStore';
import { saveSolve } from '../services/solvesService';
import { useScramble } from './useScramble';
import type { TimerState } from '../types/timer.types';

const READY_DELAY_MS = 500; // 0.5 seconds hold before ready

interface UseTimerReturn {
  state: TimerState;
  elapsedTime: number;
  formattedTime: string;
  lastSolveTime: number | null;
}

/**
 * Hook for managing timer state and controls
 *
 * Provides timer state, elapsed time, and formatted time display.
 * Automatically handles keyboard events for spacebar control.
 *
 * @returns {UseTimerReturn} Timer state and utilities
 *
 * @example
 * const { state, formattedTime, lastSolveTime } = useTimer();
 *
 * return (
 *   <div>
 *     <div>State: {state}</div>
 *     <div>Time: {formattedTime}</div>
 *   </div>
 * );
 */
export function useTimer(): UseTimerReturn {
  const state = useTimerStore((s) => s.state);
  const elapsedTime = useTimerStore((s) => s.elapsedTime);
  const lastSolveTime = useTimerStore((s) => s.lastSolveTime);

  const setState = useTimerStore((s) => s.setState);
  const setElapsedTime = useTimerStore((s) => s.setElapsedTime);
  const setStartTime = useTimerStore((s) => s.setStartTime);
  const setLastSolveTime = useTimerStore((s) => s.setLastSolveTime);

  const { generateScramble } = useScramble();

  // Refs for timing and state management
  const readyTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSpacePressed = useRef(false);

  /**
   * Formats milliseconds to display format (seconds.hundredths)
   */
  const formatTime = (ms: number): string => {
    const totalSeconds = ms / 1000;
    const seconds = Math.floor(totalSeconds);
    const hundredths = Math.floor((totalSeconds - seconds) * 100);

    return `${seconds}.${hundredths.toString().padStart(2, '0')}`;
  };

  /**
   * Updates elapsed time during timer run
   * This runs in requestAnimationFrame, not during render
   */
  const updateElapsedTime = () => {
    const currentState = useTimerStore.getState().state;
    const currentStartTime = useTimerStore.getState().startTime;

    if (currentState === 'running' && currentStartTime !== null) {
      // Safe to call performance.now() here - we're in RAF callback, not render
      const now = performance.now();
      const elapsed = now - currentStartTime;
      setElapsedTime(elapsed);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateElapsedTime);
    }
  };

  /**
   * Saves the completed solve to database
   */
  const saveSolveToDatabase = async (timeMs: number) => {
    try {
      // Get current user from auth store
      const user = useAuthStore.getState().user;
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const roundedTime = Math.round(timeMs);

      // Validate time before saving
      if (roundedTime <= 0) {
        console.error('Invalid time:', timeMs, 'rounded to:', roundedTime);
        return;
      }

      console.log('Saving solve:', {
        time_ms: roundedTime,
        scramble: useTimerStore.getState().currentScramble,
        user_id: user.id,
      });

      await saveSolve({
        user_id: user.id,
        time_ms: roundedTime,
        scramble: useTimerStore.getState().currentScramble,
        penalty_type: null,
      });

      // Generate new scramble after successful save
      generateScramble();
    } catch (error) {
      console.error('Failed to save solve:', error);
      // TODO: Show error to user via notification
    }
  };

  /**
   * Handles spacebar key down event
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only handle spacebar
    if (event.code !== 'Space') return;

    // Prevent default scrolling behavior
    event.preventDefault();

    // Ignore if already pressed (key repeat)
    if (isSpacePressed.current) return;

    isSpacePressed.current = true;

    const currentState = useTimerStore.getState().state;
    const currentElapsedTime = useTimerStore.getState().elapsedTime;

    if (currentState === 'idle') {
      // Start ready countdown (0.5 second hold)
      readyTimeoutRef.current = window.setTimeout(() => {
        setState('ready');
      }, READY_DELAY_MS);
    } else if (currentState === 'running') {
      // Stop timer
      setState('stopped');

      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Record final time
      const finalTime = currentElapsedTime;
      setLastSolveTime(finalTime);

      // Save solve asynchronously
      saveSolveToDatabase(finalTime);
    }
  };

  /**
   * Handles spacebar key up event
   */
  const handleKeyUp = (event: KeyboardEvent) => {
    // Only handle spacebar
    if (event.code !== 'Space') return;

    event.preventDefault();

    isSpacePressed.current = false;

    const currentState = useTimerStore.getState().state;

    if (currentState === 'idle') {
      // User released too early, cancel ready countdown
      if (readyTimeoutRef.current !== null) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    } else if (currentState === 'ready') {
      // Start timer
      setState('running');
      const now = performance.now();
      setStartTime(now);
      setElapsedTime(0);

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(updateElapsedTime);
    } else if (currentState === 'stopped') {
      // Reset to idle for next solve
      setState('idle');
      setElapsedTime(0);
      setStartTime(null);
    }
  };

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // Cleanup timers and animation frames
      if (readyTimeoutRef.current !== null) {
        clearTimeout(readyTimeoutRef.current);
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // Empty deps - handlers use getState() for fresh values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    lastSolveTime,
  };
}
