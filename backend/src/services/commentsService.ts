import { pgPool } from '../db/pool.js';

export interface RecipeComment {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function listRecipeComments(recipeId: string): Promise<RecipeComment[]> {
  const { rows } = await pgPool.query(
    `SELECT id, user_id, recipe_id, content, created_at, updated_at
     FROM recipe_comments WHERE recipe_id=$1 ORDER BY created_at DESC`,
    [recipeId]
  );
  return rows as RecipeComment[];
}

export async function addRecipeComment(userId: string, recipeId: string, content: string): Promise<string> {
  const { rows } = await pgPool.query(
    `INSERT INTO recipe_comments (user_id, recipe_id, content)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, recipeId, content]
  );
  return rows[0].id as string;
}

export async function deleteRecipeComment(userId: string, commentId: string, isAdmin: boolean): Promise<boolean> {
  if (isAdmin) {
    const { rowCount } = await pgPool.query('DELETE FROM recipe_comments WHERE id=$1', [commentId]);
    return Number(rowCount || 0) > 0;
  }
  const { rowCount } = await pgPool.query('DELETE FROM recipe_comments WHERE id=$1 AND user_id=$2', [commentId, userId]);
  return Number(rowCount || 0) > 0;
}