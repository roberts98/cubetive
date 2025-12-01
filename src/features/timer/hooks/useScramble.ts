/**
 * useScramble Hook
 *
 * Custom hook for generating WCA-compliant scrambles using the cubing.js library.
 * Generates 3x3 scrambles with 20 moves following official WCA standards.
 */

import { useEffect } from 'react';
import { randomScrambleForEvent } from 'cubing/scramble';
import { useTimerStore } from '../stores/timerStore';

/**
 * Hook for generating and managing scrambles
 *
 * Automatically generates a new scramble on mount and provides
 * a function to generate scrambles on demand.
 *
 * @returns {Object} Scramble utilities
 * @returns {string} currentScramble - The current scramble notation
 * @returns {() => void} generateScramble - Function to generate a new scramble
 *
 * @example
 * const { currentScramble, generateScramble } = useScramble();
 *
 * // Display current scramble
 * <div>{currentScramble}</div>
 *
 * // Generate new scramble after solve
 * generateScramble();
 */
export function useScramble() {
  const currentScramble = useTimerStore((state) => state.currentScramble);
  const setCurrentScramble = useTimerStore((state) => state.setCurrentScramble);

  /**
   * Generates a new WCA-compliant 3x3 scramble
   */
  const generateScramble = async () => {
    try {
      // Generate scramble for 3x3 cube using cubing.js
      // "333" is the WCA event code for 3x3 cube
      const scramble = await randomScrambleForEvent('333');

      // Convert scramble to string format
      const scrambleString = scramble.toString();

      setCurrentScramble(scrambleString);
    } catch (error) {
      console.error('Error generating scramble:', error);
      // Fallback to a basic scramble if generation fails
      setCurrentScramble("R U R' U R U2 R'");
    }
  };

  /**
   * Generate initial scramble on mount
   */
  useEffect(() => {
    if (!currentScramble) {
      generateScramble();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentScramble,
    generateScramble,
  };
}
