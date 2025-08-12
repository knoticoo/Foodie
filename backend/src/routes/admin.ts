import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { pgPool } from '../db/pool.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

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

// Update recipe sponsorship metadata
adminRouter.put('/recipes/:id/sponsorship', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { isSponsored?: boolean; sponsorName?: string | null; sponsorUrl?: string | null };
  await pgPool.query(
    `UPDATE recipes
     SET is_sponsored = COALESCE($1, is_sponsored),
         sponsor_name = COALESCE($2, sponsor_name),
         sponsor_url = COALESCE($3, sponsor_url)
     WHERE id = $4`,
    [body.isSponsored ?? null, body.sponsorName ?? null, body.sponsorUrl ?? null, id]
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