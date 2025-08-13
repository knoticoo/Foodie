import { pgPool } from '../db/pool.js';

/**
 * Records that a user cooked a specific recipe.
 */
export async function addCookHistory(userId: string, recipeId: string): Promise<void> {
  await pgPool.query(
    'INSERT INTO cook_history (user_id, recipe_id) VALUES ($1, $2)',
    [userId, recipeId]
  );
}

/**
 * Returns recently cooked recipe ids within N days.
 */
export async function getRecentCookedRecipeIds(userId: string, days: number): Promise<string[]> {
  const { rows } = await pgPool.query(
    `SELECT DISTINCT recipe_id
     FROM cook_history
     WHERE user_id=$1 AND cooked_at >= now() - ($2::text || ' days')::interval`,
    [userId, String(days)]
  );
  return rows.map((r: any) => r.recipe_id as string);
}