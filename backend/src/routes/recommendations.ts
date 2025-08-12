import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { recommendRecipesForUser } from '../services/recommendationsService.js';

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);

recommendationsRouter.get('/', async (req, res) => {
  const user = (req as any).user;
  const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 12;
  const recipes = await recommendRecipesForUser(user.id, { limit });
  return res.json({ recipes, limit });
});