import { pgPool } from '../db/pool.js';

export interface RecipeListFilters {
  query?: string;
  diet?: string[];
  maxTimeMinutes?: number;
  maxCostCents?: number;
}

export async function findRecipes(filters: RecipeListFilters, limit = 20, offset = 0) {
  // Build dynamic WHERE conditions and parameters
  const where: string[] = [];
  const params: any[] = [];

  if (filters.query) {
    params.push(`%${filters.query}%`);
    where.push(`title ILIKE $${params.length}`);
  }
  if (filters.diet && filters.diet.length > 0) {
    params.push(filters.diet);
    where.push(`diet && $${params.length}`); // overlap
  }
  if (filters.maxTimeMinutes != null) {
    params.push(filters.maxTimeMinutes);
    where.push(`total_time_minutes <= $${params.length}`);
  }
  if (filters.maxCostCents != null) {
    params.push(filters.maxCostCents);
    where.push(`cost_cents <= $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT id, title, description, servings, total_time_minutes, cost_cents, is_approved, is_sponsored, sponsor_name, sponsor_url
    FROM recipes
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const { rows } = await pgPool.query(sql, params);
  return rows;
}

export async function getRecipeById(id: string) {
  const sql = `
    SELECT id, title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved, author_user_id, share_token,
           is_sponsored, sponsor_name, sponsor_url
    FROM recipes WHERE id = $1
  `;
  const { rows } = await pgPool.query(sql, [id]);
  return rows[0] ?? null;
}

export async function getRecipeByShareToken(token: string) {
  const { rows } = await pgPool.query(
    `SELECT id, title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved, author_user_id, share_token,
            is_sponsored, sponsor_name, sponsor_url
     FROM recipes WHERE share_token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function createSubmittedRecipe(userId: string, payload: { title: string; description?: string; steps?: any[]; images?: string[] }) {
  const sql = `
    INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, author_user_id, is_approved)
    VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7::jsonb, $8::jsonb, $9, FALSE)
    RETURNING id, share_token
  `;
  const params = [
    payload.title,
    payload.description ?? '',
    JSON.stringify(payload.steps ?? []),
    JSON.stringify(payload.images ?? []),
    2, // default servings
    null, // total_time_minutes
    JSON.stringify({}),
    JSON.stringify([]),
    userId
  ];
  const { rows } = await pgPool.query(sql, params);
  return rows[0];
}