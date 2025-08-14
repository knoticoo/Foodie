import { Router } from 'express';
import { listRecipes, getRecipe } from '../controllers/recipesController.js';
import { aggregateGroceryList } from '../services/groceryService.js';
import { createSubmittedRecipe, getRecipeById, getRecipeByShareToken, findRecipes } from '../services/recipesService.js';
import { scaleIngredients } from '../services/scaleService.js';
import { requireAuth } from '../middleware/auth.js';
import { listRecipeRatings, upsertRecipeRating, getRecipeAverageRating } from '../services/ratingsService.js';
import { commentsRouter } from './comments.js';
 
export const recipesRouter = Router();
 
// List recipes with filters
recipesRouter.get('/', listRecipes);

// Find recipes by budget (in major units, e.g., 10 => €10.00)
recipesRouter.get('/budget', async (req, res) => {
  try {
    const budgetParam = String(req.query.budget || '').trim();
    const fallback = Number(budgetParam.replace(/[^0-9.]/g, ''));
    const budgetMajor = Number.isFinite(fallback) ? fallback : NaN;
    const limitParam = Number(String(req.query.limit || '20'));
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 20;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;

    if (!Number.isFinite(budgetMajor) || budgetMajor <= 0) {
      return res.status(400).json({ error: 'budget is required (number, e.g., 10)' });
    }
    const budgetCents = Math.round(budgetMajor * 100);

    // Optional premium filter (hide premium-only for non-premium users)
    let isPremium = false;
    if (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const { getPremiumStatus } = await import('../middleware/premium.js');
        isPremium = await getPremiumStatus(req as any);
      } catch {}
    }

    // Pull a candidate pool (recent or by query) and estimate cost per recipe
    const candidates = await findRecipes({ query: q, sortBy: 'new' }, 100, 0);

    // Compute estimated cost for each candidate
    const { priceGroceryItems } = await import('../services/priceService.js');
    const results: any[] = [];

    for (const r of candidates) {
      // Exclude unapproved and premium-only if not premium
      if (r.is_approved === false) continue;
      if (!isPremium && r.is_premium_only === true) continue;

      const full = await getRecipeById(String((r as any).id));
      const ingredients = (full as any)?.ingredients ?? [];
      if (!Array.isArray(ingredients) || ingredients.length === 0) continue;

      const aggregated = aggregateGroceryList(ingredients);
      const priced = await priceGroceryItems(aggregated);
      const total = Number(priced.totalCents || 0);
      if (total <= budgetCents && total > 0) {
        results.push({
          id: (r as any).id,
          title: (r as any).title,
          cover_image: (r as any).cover_image ?? null,
          servings: (full as any)?.servings ?? 2,
          estimatedCostCents: total
        });
      }
      if (results.length >= limit * 2) {
        // Enough matches collected, break early to keep response snappy
        break;
      }
    }

    // Sort by estimated cost ascending and cap to limit
    results.sort((a, b) => a.estimatedCostCents - b.estimatedCostCents);
    const sliced = results.slice(0, limit);
    return res.json({ recipes: sliced, limit, budgetCents });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to search by budget' });
  }
});
 
// Get by share token (public link)
recipesRouter.get('/share/:token', async (req, res) => {
  const r = await getRecipeByShareToken(req.params.token);
  if (!r) return res.status(404).json({ error: 'Recipe not found' });
  res.json(r);
});

// Get single recipe by id
recipesRouter.get('/:id', async (req, res, next) => {
  try {
    const r = await getRecipeById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Recipe not found' });
    const isPremiumOnly = (r as any).is_premium_only === true;
    if (!isPremiumOnly) return res.json(r);
    const { getPremiumStatus } = await import('../middleware/premium.js');
    const isPremium = await getPremiumStatus(req);
    if (!isPremium) return res.status(402).json({ error: 'Premium required' });
    return res.json(r);
  } catch (e) {
    next(e);
  }
});

// Comments under a recipe
recipesRouter.use('/:id/comments', commentsRouter);
 
// Submit a recipe (user-submitted, requires approval)
recipesRouter.post('/submit', requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const body = req.body as { title?: string; description?: string; steps?: any[]; images?: string[]; category?: string; difficulty?: string; total_time_minutes?: number | null; ingredients?: any[] };
    const title = (body?.title || '').trim();
    if (title.length < 3) return res.status(400).json({ error: 'title is required (min 3 chars)' });
    const created = await createSubmittedRecipe(user.id, {
      title,
      description: body?.description || '',
      steps: Array.isArray(body?.steps) ? body!.steps : [],
      images: Array.isArray(body?.images) ? body!.images : [],
      category: typeof body?.category === 'string' ? body.category : undefined,
      difficulty: typeof body?.difficulty === 'string' ? body.difficulty : undefined,
      total_time_minutes: typeof body?.total_time_minutes === 'number' ? body.total_time_minutes : undefined,
      ingredients: Array.isArray(body?.ingredients) ? body.ingredients : undefined
    });
    return res.status(201).json({ id: created.id, shareToken: created.share_token });
  } catch (e) {
    return next(e);
  }
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