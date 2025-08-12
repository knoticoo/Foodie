import type { Request, Response } from 'express';
import { assertDatabaseConnectionOk } from '../db/pool.js';

export async function getHealth(_req: Request, res: Response) {
  const startTimeMs = Date.now();
  try {
    // Fail fast: time-box the DB check to 2s
    const timeoutMs = 2000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error('health check timeout'));
      }, timeoutMs);
    });

    await Promise.race([
      assertDatabaseConnectionOk(),
      timeoutPromise
    ]);

    const durationMs = Date.now() - startTimeMs;
    if (durationMs > 1000) {
      console.warn(`[health] slow ok in ${durationMs}ms`);
    }
    res.json({ status: 'ok', db: 'ok', durationMs });
  } catch (err) {
    const durationMs = Date.now() - startTimeMs;
    const message = (err as Error).message || 'unknown error';
    console.warn(`[health] degraded after ${durationMs}ms: ${message}`);
    res.status(500).json({ status: 'degraded', db: 'error', durationMs, error: message });
  }
}