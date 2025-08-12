import { Router } from 'express';
import { listRecipes, getRecipe } from '../controllers/recipesController.js';
import { aggregateGroceryList } from '../services/groceryService.js';
import { createSubmittedRecipe, getRecipeById, getRecipeByShareToken } from '../services/recipesService.js';
import { scaleIngredients } from '../services/scaleService.js';
import { requireAuth } from '../middleware/auth.js';
import { listRecipeRatings, upsertRecipeRating, getRecipeAverageRating } from '../services/ratingsService.js';
import { commentsRouter } from './comments.js';
 
export const recipesRouter = Router();
 
// List recipes with filters
recipesRouter.get('/', listRecipes);
 
// Get by share token (public link)
recipesRouter.get('/share/:token', async (req, res) => {
  const r = await getRecipeByShareToken(req.params.token);
  if (!r) return res.status(404).json({ error: 'Recipe not found' });
  res.json(r);
});

// Get single recipe by id
recipesRouter.get('/:id', getRecipe);

// Comments under a recipe
recipesRouter.use('/:id/comments', commentsRouter);
 
// Submit a recipe (user-submitted, requires approval)
recipesRouter.post('/submit', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const body = req.body as { title?: string; description?: string; steps?: any[]; images?: string[] };
  const title = (body?.title || '').trim();
  if (title.length < 3) return res.status(400).json({ error: 'title is required (min 3 chars)' });
  const created = await createSubmittedRecipe(user.id, {
    title,
    description: body?.description || '',
    steps: Array.isArray(body?.steps) ? body!.steps : [],
    images: Array.isArray(body?.images) ? body!.images : []
  });
  return res.status(201).json({ id: created.id, shareToken: created.share_token });
});
 
// Ratings
recipesRouter.get('/:id/ratings', async (req, res) => {
  const ratings = await listRecipeRatings(req.params.id);
  const avg = await getRecipeAverageRating(req.params.id);
  return res.json({ average: avg, ratings });
});
 
recipesRouter.post('/:id/ratings', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const rating = Number((req.body as any)?.rating);
  const comment = typeof (req.body as any)?.comment === 'string' ? String((req.body as any).comment) : null;
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1..5' });
  await upsertRecipeRating(user.id, req.params.id, rating, comment);
  return res.status(204).end();
});
 
// Get aggregated grocery list for a recipe
recipesRouter.get('/:id/grocery-list', async (req, res) => {
  const recipe = await getRecipeById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  const ingredients = (recipe as any).ingredients ?? [];
  const aggregated = aggregateGroceryList(ingredients);

  // Optional pricing integration
  const includeCost = String(req.query.includeCost ?? 'true') === 'true';
  if (includeCost) {
    // Premium required to include cost; admins bypass
    const { getPremiumStatus } = await import('../middleware/premium.js');
    const isPremium = await getPremiumStatus(req);
    if (!isPremium) {
      return res.status(402).json({ error: 'Premium required for cost estimation', items: aggregated });
    }
    const { priceGroceryItems } = await import('../services/priceService.js');
    const pricing = await priceGroceryItems(aggregated);
    return res.json({ items: aggregated, pricing });
  }
  res.json({ items: aggregated });
});

// Get scaled ingredients for a recipe
recipesRouter.get('/:id/scale', async (req, res) => {
  const recipe = await getRecipeById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  const newServings = Number(req.query.servings ?? recipe.servings ?? 2);
  const ingredients = (recipe as any).ingredients ?? [];
  const scaled = scaleIngredients(ingredients, recipe.servings ?? 2, newServings);
  res.json({ servings: newServings, ingredients: scaled });
});

// Aggregate grocery list for multiple recipes
recipesRouter.post('/grocery-list', async (req, res) => {
  const body = req.body as { recipes: { id: string; servings?: number }[]; includeCost?: boolean };
  if (!body?.recipes || !Array.isArray(body.recipes) || body.recipes.length === 0) {
    return res.status(400).json({ error: 'recipes array required' });
  }
  const all: any[] = [];
  for (const item of body.recipes) {
    const r = await getRecipeById(item.id);
    if (!r) continue;
    const baseServings = r.servings ?? 2;
    const ing = (r as any).ingredients ?? [];
    const scaled = item.servings ? scaleIngredients(ing, baseServings, item.servings) : ing;
    all.push(...scaled);
  }
  const aggregated = aggregateGroceryList(all);

  const includeCost = body.includeCost ?? true;
  if (includeCost) {
    const { getPremiumStatus } = await import('../middleware/premium.js');
    const isPremium = await getPremiumStatus(req as any);
    if (!isPremium) {
      return res.status(402).json({ error: 'Premium required for cost estimation', items: aggregated });
    }
    const { priceGroceryItems } = await import('../services/priceService.js');
    const pricing = await priceGroceryItems(aggregated);
    return res.json({ items: aggregated, pricing });
  }
  res.json({ items: aggregated });
});