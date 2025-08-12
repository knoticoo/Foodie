import { pgPool } from '../db/pool.js';

export async function addFavorite(userId: string, recipeId: string) {
  await pgPool.query(
    'INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, recipeId]
  );
}

export async function removeFavorite(userId: string, recipeId: string) {
  await pgPool.query('DELETE FROM favorites WHERE user_id=$1 AND recipe_id=$2', [userId, recipeId]);
}

export async function listFavorites(userId: string) {
  const { rows } = await pgPool.query(
    'SELECT r.id, r.title FROM favorites f JOIN recipes r ON r.id=f.recipe_id WHERE f.user_id=$1 ORDER BY f.created_at DESC',
    [userId]
  );
  return rows;
}