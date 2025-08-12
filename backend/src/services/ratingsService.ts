import { pgPool } from '../db/pool.js';

export interface RecipeRatingRow {
  user_id: string;
  recipe_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export async function upsertRecipeRating(userId: string, recipeId: string, rating: number, comment?: string | null): Promise<void> {
  const sql = `
    INSERT INTO recipe_ratings (user_id, recipe_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, recipe_id)
    DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = now()
  `;
  await pgPool.query(sql, [userId, recipeId, rating, comment ?? null]);
}

export async function listRecipeRatings(recipeId: string): Promise<RecipeRatingRow[]> {
  const { rows } = await pgPool.query(
    `SELECT user_id, recipe_id, rating, comment, created_at, updated_at
     FROM recipe_ratings WHERE recipe_id = $1 ORDER BY created_at DESC`,
    [recipeId]
  );
  return rows as RecipeRatingRow[];
}

export async function getRecipeAverageRating(recipeId: string): Promise<number | null> {
  const { rows } = await pgPool.query(`SELECT AVG(rating)::numeric(10,2) AS avg FROM recipe_ratings WHERE recipe_id=$1`, [recipeId]);
  if (rows.length === 0 || rows[0].avg == null) return null;
  return Number(rows[0].avg);
}