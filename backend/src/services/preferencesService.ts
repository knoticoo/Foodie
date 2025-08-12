import { pgPool } from '../db/pool.js';

export interface UserPreferences {
  userId: string;
  dietPreferences: string[];
  budgetCents: number | null;
}

/**
 * Loads user preferences or returns defaults if none exist.
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { rows } = await pgPool.query(
    'SELECT user_id, diet_preferences, budget_cents FROM user_preferences WHERE user_id=$1',
    [userId]
  );
  if (rows.length === 0) {
    return { userId, dietPreferences: [], budgetCents: null };
  }
  const r = rows[0];
  return {
    userId: r.user_id as string,
    dietPreferences: (r.diet_preferences as string[]) ?? [],
    budgetCents: (r.budget_cents as number) ?? null
  };
}

/**
 * Upserts user preferences.
 */
export async function upsertUserPreferences(userId: string, dietPreferences: string[], budgetCents?: number | null): Promise<void> {
  await pgPool.query(
    `INSERT INTO user_preferences (user_id, diet_preferences, budget_cents)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET diet_preferences = EXCLUDED.diet_preferences, budget_cents = EXCLUDED.budget_cents`,
    [userId, dietPreferences, budgetCents ?? null]
  );
}