import { pgPool } from '../db/pool.js';

export interface RecipeListFilters {
  query?: string;
  ingredientQuery?: string;
  diet?: string[];
  maxTimeMinutes?: number;
  maxCostCents?: number;
  sortBy?: 'new' | 'top';
}

export async function findRecipes(filters: RecipeListFilters, limit = 20, offset = 0) {
  // Build dynamic WHERE conditions and parameters
  const where: string[] = [];
  const params: any[] = [];

  if (filters.query) {
    params.push(`%${filters.query}%`);
    where.push(`title ILIKE $${params.length}`);
  }
  if (filters.ingredientQuery) {
    params.push(`%${filters.ingredientQuery.toLowerCase()}%`);
    // Search inside ingredients JSONB array for name match
    where.push(`EXISTS (
      SELECT 1 FROM jsonb_array_elements(ingredients) AS ing
      WHERE lower(ing->>'name') LIKE $${params.length}
    )`);
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

  const orderSql = (filters.sortBy === 'top')
    ? `ORDER BY avg_rating DESC NULLS LAST, rating_count DESC NULLS LAST, created_at DESC`
    : `ORDER BY created_at DESC`;

  const sql = `
    SELECT 
      id,
      title,
      description,
      servings,
      total_time_minutes,
      cost_cents,
      is_approved,
      is_sponsored,
      sponsor_name,
      sponsor_url,
      is_premium_only,
      created_at,
      author_user_id,
      (SELECT email FROM users u WHERE u.id = recipes.author_user_id) AS author_email,
      images->>0 AS cover_image,
      (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), NULL)
        FROM recipe_ratings rr
        WHERE rr.recipe_id = recipes.id
      ) AS avg_rating,
      (
        SELECT COUNT(*)::int
        FROM recipe_ratings rr2
        WHERE rr2.recipe_id = recipes.id
      ) AS rating_count
    FROM recipes
    ${whereSql}
    ${orderSql}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const { rows } = await pgPool.query(sql, params);
  return rows;
}

export async function getRecipeById(id: string) {
  const sql = `
    SELECT id, title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved, author_user_id, share_token,
           is_sponsored, sponsor_name, sponsor_url, is_premium_only, category, difficulty
    FROM recipes WHERE id = $1
  `;
  const { rows } = await pgPool.query(sql, [id]);
  return rows[0] ?? null;
}

export async function getRecipeByShareToken(token: string) {
  const { rows } = await pgPool.query(
    `SELECT id, title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved, author_user_id, share_token,
            is_sponsored, sponsor_name, sponsor_url, is_premium_only
     FROM recipes WHERE share_token = $1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function createSubmittedRecipe(userId: string, payload: { title: string; description?: string; steps?: any[]; images?: string[]; category?: string; difficulty?: string; total_time_minutes?: number; ingredients?: any[] }) {
  const sql = `
    INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, author_user_id, is_approved, category, difficulty)
    VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7::jsonb, $8::jsonb, $9, TRUE, $10, $11)
    RETURNING id, share_token
  `;
  const params = [
    payload.title,
    payload.description ?? '',
    JSON.stringify(payload.steps ?? []),
    JSON.stringify(payload.images ?? []),
    2, // default servings
    payload.total_time_minutes ?? null,
    JSON.stringify({}),
    JSON.stringify(payload.ingredients ?? []),
    userId,
    payload.category ?? null,
    payload.difficulty ?? null
  ];
  const { rows } = await pgPool.query(sql, params);
  return rows[0];
}