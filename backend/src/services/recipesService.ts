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
    SELECT id, title, description, servings, total_time_minutes, cost_cents
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
    SELECT id, title, description, steps, images, servings, total_time_minutes, nutrition, ingredients
    FROM recipes WHERE id = $1
  `;
  const { rows } = await pgPool.query(sql, [id]);
  return rows[0] ?? null;
}