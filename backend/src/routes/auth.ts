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
    const { rows } = await pgPool.query('SELECT email, is_admin FROM users WHERE id = $1', [user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ email: rows[0].email, is_admin: rows[0].is_admin === true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});