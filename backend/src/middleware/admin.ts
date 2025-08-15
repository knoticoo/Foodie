import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../db/pool.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
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