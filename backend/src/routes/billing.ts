import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';

export const billingRouter = Router();

// Create a fake checkout session (stub). In production, integrate Stripe.
billingRouter.post('/checkout', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: string };
  // Pretend we created a checkout and immediately grant premium for 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pgPool.query('UPDATE users SET is_premium = TRUE, premium_expires_at = $1 WHERE id = $2', [expires.toISOString(), user.id]);
  res.json({ ok: true, premium_expires_at: expires.toISOString() });
});

// Webhook stub (no-op)
billingRouter.post('/webhook', async (_req, res) => {
  res.status(204).end();
});

// Fetch current subscription status
billingRouter.get('/status', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: string };
  const { rows } = await pgPool.query('SELECT is_premium, premium_expires_at FROM users WHERE id = $1', [user.id]);
  const r = rows[0] || { is_premium: false, premium_expires_at: null };
  res.json({ isPremium: Boolean(r.is_premium) || (r.premium_expires_at && new Date(r.premium_expires_at) > new Date()), premiumExpiresAt: r.premium_expires_at });
});