import { pgPool } from '../db/pool.js';

export interface PlannedMealInput {
  date: string; // YYYY-MM-DD within the requested week
  mealSlot: string; // breakfast | lunch | dinner | snack | custom
  recipeId: string;
  servings?: number;
}

export interface PlannedMealRow {
  id: string;
  planned_date: string;
  meal_slot: string;
  recipe_id: string;
  servings: number | null;
}

/**
 * Returns planned meals for a user within a date range [start, end].
 */
export async function listPlannedMeals(userId: string, startDate: string, endDate: string): Promise<PlannedMealRow[]> {
  const sql = `
    SELECT id, planned_date, meal_slot, recipe_id, servings
    FROM planned_meals
    WHERE user_id = $1 AND planned_date BETWEEN $2 AND $3
    ORDER BY planned_date ASC, meal_slot ASC
  `;
  const { rows } = await pgPool.query(sql, [userId, startDate, endDate]);
  return rows as PlannedMealRow[];
}

/**
 * Replaces the entire week plan for a user. Existing items in [startDate, endDate] are removed, then new items inserted.
 */
export async function replaceWeekPlan(userId: string, startDate: string, endDate: string, items: PlannedMealInput[]): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM planned_meals WHERE user_id=$1 AND planned_date BETWEEN $2 AND $3', [userId, startDate, endDate]);
    for (const item of items) {
      await client.query(
        `INSERT INTO planned_meals (user_id, recipe_id, planned_date, meal_slot, servings)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, item.recipeId, item.date, item.mealSlot, item.servings ?? null]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Utility to compute week end date (inclusive) given a week start date.
 */
export function computeWeekEndInclusive(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00Z');
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return end.toISOString().slice(0, 10);
}