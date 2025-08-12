import { Router } from 'express';
import { pgPool } from '../db/pool.js';

export const challengesRouter = Router();

// Public: list all challenges (active and upcoming)
challengesRouter.get('/', async (_req, res) => {
  const { rows } = await pgPool.query(
    `SELECT id, title, description, start_date, end_date
     FROM challenges
     ORDER BY start_date DESC`
  );
  res.json({ challenges: rows });
});