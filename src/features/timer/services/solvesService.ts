/**
 * Solves Service
 *
 * Service layer for managing solve records in the database.
 * Handles CRUD operations for solve times, scrambles, and penalties.
 */

import { supabase } from '../../../db/supabase';
import type { SolveDTO, CreateSolveData, UpdateSolvePenaltyData } from '../types/timer.types';

/**
 * Saves a new solve to the database.
 *
 * Creates a new solve record with the provided time, scramble, and optional penalty.
 * The solve is automatically associated with the authenticated user.
 *
 * @param {CreateSolveData} solveData - The solve data to save
 * @returns {Promise<SolveDTO>} The created solve record
 * @throws {Error} 'Unauthorized' if no user is authenticated
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * const solve = await saveSolve({
 *   user_id: userId,
 *   time_ms: 12450,
 *   scramble: "R U R' U'",
 *   penalty_type: null
 * });
 */
export async function saveSolve(solveData: CreateSolveData): Promise<SolveDTO> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('solves')
    .insert({
      user_id: solveData.user_id,
      time_ms: solveData.time_ms,
      scramble: solveData.scramble,
      penalty_type: solveData.penalty_type,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to save solve');
  }

  return data as SolveDTO;
}

/**
 * Fetches a user's solve history with pagination.
 *
 * Retrieves solve records in reverse chronological order (newest first).
 * Supports pagination for loading large solve histories.
 *
 * @param {string} userId - The user's ID
 * @param {number} [limit=50] - Maximum number of solves to return
 * @param {number} [offset=0] - Number of solves to skip (for pagination)
 * @returns {Promise<SolveDTO[]>} Array of solve records
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * const solves = await getUserSolves(userId, 50, 0);
 * console.log(`Loaded ${solves.length} solves`);
 */
export async function getUserSolves(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SolveDTO[]> {
  const { data, error } = await supabase
    .from('solves')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return (data as SolveDTO[]) || [];
}

/**
 * Fetches the most recent solves for a user.
 *
 * Used for calculating session statistics (Ao5, Ao12, etc.).
 * Returns solves in reverse chronological order.
 *
 * @param {string} userId - The user's ID
 * @param {number} count - Number of recent solves to fetch
 * @returns {Promise<SolveDTO[]>} Array of recent solve records
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * const recent = await getRecentSolves(userId, 12);
 * const ao12 = calculateAo12(recent);
 */
export async function getRecentSolves(userId: string, count: number): Promise<SolveDTO[]> {
  const { data, error } = await supabase
    .from('solves')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    throw error;
  }

  return (data as SolveDTO[]) || [];
}

/**
 * Soft deletes a solve by setting its deleted_at timestamp.
 *
 * The solve is not physically removed from the database but marked as deleted.
 * RLS policies ensure users can only delete their own solves.
 *
 * @param {string} solveId - The solve's ID
 * @returns {Promise<void>}
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * await deleteSolve(solve.id);
 */
export async function deleteSolve(solveId: string): Promise<void> {
  const { error } = await supabase
    .from('solves')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', solveId);

  if (error) {
    throw error;
  }
}

/**
 * Updates the penalty type for a solve.
 *
 * Allows changing or removing penalties (DNF, +2) after a solve is completed.
 * Used when the user modifies penalties via the penalty buttons.
 *
 * @param {string} solveId - The solve's ID
 * @param {UpdateSolvePenaltyData} penaltyData - The new penalty data
 * @returns {Promise<void>}
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * await updateSolvePenalty(solve.id, { penalty_type: '+2' });
 */
export async function updateSolvePenalty(
  solveId: string,
  penaltyData: UpdateSolvePenaltyData
): Promise<void> {
  const { error } = await supabase
    .from('solves')
    .update({ penalty_type: penaltyData.penalty_type })
    .eq('id', solveId);

  if (error) {
    throw error;
  }
}

/**
 * Gets the total count of solves for a user.
 *
 * Used for tracking storage limits (10,000 solve limit per user).
 * Only counts non-deleted solves.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} Total number of solves
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * const count = await getSolveCount(userId);
 * if (count >= 10000) {
 *   console.warn('Storage limit reached');
 * }
 */
export async function getSolveCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('solves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Fetches all solves for a user.
 *
 * Used for recalculating statistics when solves are deleted.
 * Returns solves in chronological order (oldest first).
 * Limited to 10,000 solves per user by design.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<SolveDTO[]>} Array of all solve records
 * @throws {Error} Database errors from Supabase
 *
 * @example
 * const allSolves = await getAllSolves(userId);
 * const pb = findPersonalBest(allSolves);
 */
export async function getAllSolves(userId: string): Promise<SolveDTO[]> {
  const { data, error } = await supabase
    .from('solves')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(10000); // Max solves per user

  if (error) {
    throw error;
  }

  return (data as SolveDTO[]) || [];
}
