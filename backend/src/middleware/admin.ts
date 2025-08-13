import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../db/pool.js';
import { env } from '../config/env.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // API key bypass for admin automation and admin panel
  const key = req.headers['x-admin-api-key'];
  if (typeof key === 'string' && key && env.adminApiKey && key === env.adminApiKey) {
    return next();
  }

  const user = (req as any).user as { id: string } | undefined;
  if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { rows } = await pgPool.query('SELECT is_admin FROM users WHERE id=$1', [user.id]);
    if (rows.length === 0 || rows[0].is_admin !== true) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(500).json({ error: 'Admin check failed' });
  }
}