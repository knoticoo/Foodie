import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserPreferences, upsertUserPreferences } from '../services/preferencesService.js';

export const preferencesRouter = Router();

preferencesRouter.use(requireAuth);

// Get current user's preferences
preferencesRouter.get('/', async (req, res) => {
  const user = (req as any).user;
  const prefs = await getUserPreferences(user.id);
  return res.json(prefs);
});

// Update current user's preferences
preferencesRouter.put('/', async (req, res) => {
  const user = (req as any).user;
  const body = req.body as { dietPreferences?: string[]; budgetCents?: number | null };
  const diet = Array.isArray(body?.dietPreferences) ? body.dietPreferences : [];
  const budget = typeof body?.budgetCents === 'number' ? body.budgetCents : null;
  await upsertUserPreferences(user.id, diet, budget);
  return res.status(204).end();
});