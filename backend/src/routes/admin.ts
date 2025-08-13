import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { pgPool } from '../db/pool.js';
import { findRecipes } from '../services/recipesService.js';

export const adminRouter = Router();

// All admin routes require auth+admin
adminRouter.use(requireAuth, requireAdmin);

// List recipes for admin (supports status filter: all|pending|approved)
adminRouter.get('/recipes', async (req, res) => {
  const status = String(req.query.status ?? 'all');
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const sortBy = (req.query.sortBy === 'top' || req.query.sortBy === 'new') ? (req.query.sortBy as 'top' | 'new') : undefined;
  const limit = typeof req.query.limit === 'string' ? Math.min(Number(req.query.limit), 200) : 50;
  const offset = typeof req.query.offset === 'string' ? Math.max(Number(req.query.offset), 0) : 0;

  const recipes = await findRecipes({ query: q, sortBy }, limit, offset);
  let filtered = recipes;
  if (status === 'pending') filtered = recipes.filter((r: any) => r.is_approved === false);
  if (status === 'approved') filtered = recipes.filter((r: any) => r.is_approved !== false);

  res.json({ recipes: filtered, limit, offset });
});

// Create recipe (admin)
adminRouter.post('/recipes', async (req, res) => {
  const body = req.body as any;
  const title = String(body.title || '').trim();
  if (title.length < 3) return res.status(400).json({ error: 'title required' });
  const { rows } = await pgPool.query(
    `INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, nutrition, ingredients, is_approved)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, COALESCE($5,2), $6, $7::jsonb, $8::jsonb, TRUE)
     RETURNING id`,
    [
      title,
      body.description ?? '',
      JSON.stringify(body.steps ?? []),
      JSON.stringify(body.images ?? []),
      body.servings ?? 2,
      body.total_time_minutes ?? null,
      JSON.stringify(body.nutrition ?? {}),
      JSON.stringify(body.ingredients ?? [])
    ]
  );
  res.status(201).json({ id: rows[0].id });
});

// Update recipe (admin)
adminRouter.put('/recipes/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as any;
  const result = await pgPool.query(
    `UPDATE recipes SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      steps = COALESCE($3::jsonb, steps),
      images = COALESCE($4::jsonb, images),
      servings = COALESCE($5, servings),
      total_time_minutes = COALESCE($6, total_time_minutes),
      nutrition = COALESCE($7::jsonb, nutrition),
      ingredients = COALESCE($8::jsonb, ingredients)
     WHERE id=$9`,
    [
      body.title ?? null,
      body.description ?? null,
      body.steps ? JSON.stringify(body.steps) : null,
      body.images ? JSON.stringify(body.images) : null,
      body.servings ?? null,
      body.total_time_minutes ?? null,
      body.nutrition ? JSON.stringify(body.nutrition) : null,
      body.ingredients ? JSON.stringify(body.ingredients) : null,
      id
    ]
  );
  const changed = Number(result.rowCount || 0) > 0;
  return changed ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

// Delete recipe (admin)
adminRouter.delete('/recipes/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const result = await pgPool.query('DELETE FROM recipes WHERE id=$1', [id]);
  const changed = Number(result.rowCount || 0) > 0;
  return changed ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

// Approve or reject a recipe
adminRouter.put('/recipes/:id/approval', async (req, res) => {
  const id = String(req.params.id || '');
  const { isApproved } = req.body as { isApproved?: boolean };
  const result = await pgPool.query('UPDATE recipes SET is_approved=$1 WHERE id=$2', [isApproved === false ? false : true, id]);
  const changed = Number(result.rowCount || 0) > 0;
  return changed ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

// Challenges CRUD
adminRouter.post('/challenges', async (req, res) => {
  const body = req.body as { title?: string; description?: string; start_date?: string; end_date?: string };
  const title = (body.title || '').trim();
  if (title.length < 3) return res.status(400).json({ error: 'title required' });
  const { rows } = await pgPool.query(
    `INSERT INTO challenges (title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [title, body.description ?? '', body.start_date, body.end_date]
  );
  res.status(201).json({ id: rows[0].id });
});

adminRouter.put('/challenges/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { title?: string; description?: string; start_date?: string; end_date?: string };
  const result = await pgPool.query(
    `UPDATE challenges SET title=COALESCE($1,title), description=COALESCE($2,description), start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date)
     WHERE id=$5`,
    [body.title ?? null, body.description ?? null, body.start_date ?? null, body.end_date ?? null, id]
  );
  const changed = Number(result.rowCount || 0) > 0;
  return changed ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

adminRouter.delete('/challenges/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const result = await pgPool.query('DELETE FROM challenges WHERE id=$1', [id]);
  const changed = Number(result.rowCount || 0) > 0;
  return changed ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

adminRouter.put('/challenges/:id/recipes', async (req, res) => {
  const id = String(req.params.id || '');
  const recipeIds = Array.isArray((req.body as any)?.recipeIds) ? (req.body as any).recipeIds as string[] : [];
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM challenge_recipes WHERE challenge_id=$1', [id]);
    for (const rid of recipeIds) {
      await client.query('INSERT INTO challenge_recipes (challenge_id, recipe_id) VALUES ($1, $2)', [id, rid]);
    }
    await client.query('COMMIT');
    res.status(204).end();
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update challenge recipes' });
  } finally {
    client.release();
  }
});

// Set or unset a user's premium status (and optional expiry)
adminRouter.put('/users/:id/premium', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { isPremium?: boolean; premiumExpiresAt?: string | null };
  const isPremium = body.isPremium === true;
  const expires = body.premiumExpiresAt ?? null;
  await pgPool.query('UPDATE users SET is_premium=$1, premium_expires_at=$2 WHERE id=$3', [isPremium, expires, id]);
  res.status(204).end();
});

// Toggle admin flag
adminRouter.put('/users/:id/admin', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { isAdmin?: boolean };
  await pgPool.query('UPDATE users SET is_admin=$1 WHERE id=$2', [body.isAdmin === true, id]);
  res.status(204).end();
});

// List users for admin (supports filter: all|new|premium)
adminRouter.get('/users', async (req, res) => {
  const status = String(req.query.status ?? 'all');
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const limit = typeof req.query.limit === 'string' ? Math.min(Number(req.query.limit), 500) : 100;
  const offset = typeof req.query.offset === 'string' ? Math.max(Number(req.query.offset), 0) : 0;

  const where: string[] = [];
  const params: any[] = [];
  if (q) { params.push(`%${q}%`); where.push(`email ILIKE $${params.length}`); }
  if (status === 'new') { where.push(`created_at >= now() - interval '7 days'`); }
  if (status === 'premium') { where.push(`is_premium = TRUE AND (premium_expires_at IS NULL OR premium_expires_at > now())`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = `
    SELECT id, email, is_admin, is_premium, premium_expires_at, created_at
    FROM users
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const { rows } = await pgPool.query(sql, params);
  res.json({ users: rows, limit, offset });
});

// Update recipe sponsorship metadata and premium-only flag
adminRouter.put('/recipes/:id/sponsorship', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { isSponsored?: boolean; sponsorName?: string | null; sponsorUrl?: string | null; isPremiumOnly?: boolean | null };
  await pgPool.query(
    `UPDATE recipes
     SET is_sponsored = COALESCE($1, is_sponsored),
         sponsor_name = COALESCE($2, sponsor_name),
         sponsor_url = COALESCE($3, sponsor_url),
         is_premium_only = COALESCE($4, is_premium_only)
     WHERE id = $5`,
    [body.isSponsored ?? null, body.sponsorName ?? null, body.sponsorUrl ?? null, body.isPremiumOnly ?? null, id]
  );
  res.status(204).end();
});

// Set affiliate URL template for a store
adminRouter.put('/stores/:id/affiliate-template', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { template?: string };
  const template = (body.template || '').trim();
  await pgPool.query('UPDATE stores SET affiliate_url_template=$1 WHERE id=$2', [template || null, id]);
  res.status(204).end();
});

// Admin: list latest comments across recipes
adminRouter.get('/comments', async (_req, res) => {
  const { rows } = await pgPool.query(
    `SELECT c.id, c.user_id, u.email, c.recipe_id, r.title AS recipe_title, c.content, c.created_at
     FROM recipe_comments c
     JOIN users u ON u.id = c.user_id
     JOIN recipes r ON r.id = c.recipe_id
     ORDER BY c.created_at DESC
     LIMIT 200`
  );
  res.json({ comments: rows });
});