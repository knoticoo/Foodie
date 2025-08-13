import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user as { id: string; email: string };
    const { rows } = await pgPool.query('SELECT email, is_admin, is_premium, premium_expires_at FROM users WHERE id = $1', [user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ email: rows[0].email, is_admin: rows[0].is_admin === true, is_premium: rows[0].is_premium === true, premium_expires_at: rows[0].premium_expires_at || null });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Bootstrap: promote first user to admin if no admins exist
authRouter.post('/bootstrap-admin', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: string };
  const { rows } = await pgPool.query('SELECT COUNT(*)::int AS cnt FROM users WHERE is_admin = TRUE');
  const count = Number(rows[0]?.cnt || 0);
  if (count > 0) return res.status(409).json({ error: 'Admin already exists' });
  await pgPool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [user.id]);
  return res.status(204).end();
});