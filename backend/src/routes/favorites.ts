import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addFavorite, removeFavorite, listFavorites } from '../services/favoritesService.js';

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.get('/', async (req, res) => {
  const user = (req as any).user;
  const items = await listFavorites(user.id);
  res.json({ favorites: items });
});

favoritesRouter.post('/:recipeId', async (req, res) => {
  const user = (req as any).user;
  await addFavorite(user.id, req.params.recipeId);
  res.status(204).end();
});

favoritesRouter.delete('/:recipeId', async (req, res) => {
  const user = (req as any).user;
  await removeFavorite(user.id, req.params.recipeId);
  res.status(204).end();
});