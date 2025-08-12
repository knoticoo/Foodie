import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addCookHistory } from '../services/historyService.js';

export const historyRouter = Router();

historyRouter.use(requireAuth);

// Mark a recipe as cooked by the current user
historyRouter.post('/:recipeId', async (req, res) => {
  const user = (req as any).user;
  const recipeId = String(req.params.recipeId || '');
  if (!recipeId) return res.status(400).json({ error: 'recipeId required' });
  await addCookHistory(user.id, recipeId);
  return res.status(204).end();
});