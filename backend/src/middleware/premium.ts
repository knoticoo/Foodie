import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../db/pool.js';

export async function requirePremium(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as { id: string } | undefined;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { rows } = await pgPool.query(
      `SELECT is_premium, is_admin, premium_expires_at FROM users WHERE id = $1`,
      [user.id]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Unauthorized' });
    const r = rows[0];
    const isPremiumActive = Boolean(r.is_admin) || Boolean(r.is_premium) || (r.premium_expires_at && new Date(r.premium_expires_at) > new Date());
    if (!isPremiumActive) return res.status(402).json({ error: 'Premium required' });
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Failed to verify premium status' });
  }
}

export async function getPremiumStatus(req: Request): Promise<boolean> {
  const user = (req as any).user as { id: string } | undefined;
  if (!user) return false;
  try {
    const { rows } = await pgPool.query(
      `SELECT is_premium, is_admin, premium_expires_at FROM users WHERE id = $1`,
      [user.id]
    );
    if (rows.length === 0) return false;
    const r = rows[0];
    return Boolean(r.is_admin) || Boolean(r.is_premium) || (r.premium_expires_at && new Date(r.premium_expires_at) > new Date());
  } catch {
    return false;
  }
}