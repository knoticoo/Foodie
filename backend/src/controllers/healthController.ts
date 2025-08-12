import type { Request, Response } from 'express';
import { assertDatabaseConnectionOk } from '../db/pool.js';

export async function getHealth(_req: Request, res: Response) {
  try {
    await assertDatabaseConnectionOk();
    res.json({ status: 'ok', db: 'ok' });
  } catch {
    res.status(500).json({ status: 'degraded', db: 'error' });
  }
}