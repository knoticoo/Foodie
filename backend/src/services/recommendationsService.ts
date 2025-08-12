import { pgPool } from '../db/pool.js';
import { getUserPreferences } from './preferencesService.js';
import { getRecentCookedRecipeIds } from './historyService.js';

export interface RecommendationOptions {
  limit?: number;
}

/**
 * Returns recipe recommendations for a user based on diet preferences and recent cooking history.
 * Simple heuristic: filter by diet overlap if any, exclude recipes cooked in the last 30 days, order randomly.
 */
export async function recommendRecipesForUser(userId: string, options: RecommendationOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 50);
  const prefs = await getUserPreferences(userId);
  const recent = await getRecentCookedRecipeIds(userId, 30);

  const where: string[] = [];
  const params: any[] = [];

  if (prefs.dietPreferences.length > 0) {
    params.push(prefs.dietPreferences);
    where.push(`diet && $${params.length}`);
  }
  if (recent.length > 0) {
    params.push(recent);
    where.push(`id <> ALL($${params.length})`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT id, title, description, servings, total_time_minutes, cost_cents
    FROM recipes
    ${whereSql}
    ORDER BY random()
    LIMIT ${limit}
  `;
  const { rows } = await pgPool.query(sql, params);
  return rows;
}