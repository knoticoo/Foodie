import { Router } from 'express';
import { pgPool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

export const adsRouter = Router();

// Public: list active ads for a placement
adsRouter.get('/', async (req, res) => {
  const placement = String(req.query.placement || '').trim();
  if (!placement) return res.status(400).json({ error: 'placement is required' });
  const { rows } = await pgPool.query(
    `SELECT id, placement, image_url, target_url
     FROM ad_slots
     WHERE placement = $1 AND is_active = TRUE
     ORDER BY created_at DESC
     LIMIT 10`,
    [placement]
  );
  res.json({ ads: rows });
});

// Admin section
adsRouter.use(requireAuth, requireAdmin);

adsRouter.post('/', async (req, res) => {
  const body = req.body as { placement?: string; image_url?: string; target_url?: string; is_active?: boolean };
  const placement = (body.placement || '').trim();
  const image = (body.image_url || '').trim();
  const target = (body.target_url || '').trim();
  const isActive = body.is_active !== false;
  if (!placement || !image || !target) return res.status(400).json({ error: 'placement, image_url, target_url required' });
  const { rows } = await pgPool.query(
    `INSERT INTO ad_slots (placement, image_url, target_url, is_active)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [placement, image, target, isActive]
  );
  res.status(201).json({ id: rows[0].id });
});

adsRouter.put('/:id', async (req, res) => {
  const id = String(req.params.id || '');
  const body = req.body as { placement?: string | null; image_url?: string | null; target_url?: string | null; is_active?: boolean | null };
  await pgPool.query(
    `UPDATE ad_slots SET
       placement = COALESCE($1, placement),
       image_url = COALESCE($2, image_url),
       target_url = COALESCE($3, target_url),
       is_active = COALESCE($4, is_active)
     WHERE id = $5`,
    [body.placement ?? null, body.image_url ?? null, body.target_url ?? null, body.is_active ?? null, id]
  );
  res.status(204).end();
});

adsRouter.delete('/:id', async (req, res) => {
  const id = String(req.params.id || '');
  await pgPool.query('DELETE FROM ad_slots WHERE id=$1', [id]);
  res.status(204).end();
});