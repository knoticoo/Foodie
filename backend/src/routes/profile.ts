import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', async (req, res) => {
  const user = (req as any).user as { id: string };
  const prefsRes = await pgPool.query('SELECT diet_preferences AS dietPreferences, budget_cents AS budgetCents FROM user_preferences WHERE user_id=$1', [user.id]);
  const favsRes = await pgPool.query('SELECT recipe_id FROM favorites WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [user.id]);
  res.json({
    userId: user.id,
    preferences: prefsRes.rows[0] || { dietPreferences: [], budgetCents: null },
    favorites: favsRes.rows.map(r => r.recipe_id)
  });
});