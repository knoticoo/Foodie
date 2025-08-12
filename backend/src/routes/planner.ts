import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { computeWeekEndInclusive, listPlannedMeals, replaceWeekPlan, type PlannedMealInput } from '../services/plannerService.js';
import { getRecipeById } from '../services/recipesService.js';
import { aggregateGroceryList, type IngredientItem } from '../services/groceryService.js';

export const plannerRouter = Router();

plannerRouter.use(requireAuth);

// Get weekly plan for the authenticated user
plannerRouter.get('/week', async (req, res) => {
  const user = (req as any).user;
  const weekStart = String(req.query.weekStart || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return res.status(400).json({ error: 'weekStart (YYYY-MM-DD) is required' });
  }
  const weekEnd = computeWeekEndInclusive(weekStart);
  const items = await listPlannedMeals(user.id, weekStart, weekEnd);
  return res.json({ weekStart, weekEnd, items });
});

// Replace weekly plan for the authenticated user
plannerRouter.put('/week', async (req, res) => {
  const user = (req as any).user;
  const body = req.body as { weekStart: string; items: PlannedMealInput[] };
  const weekStart = String(body?.weekStart || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return res.status(400).json({ error: 'weekStart (YYYY-MM-DD) is required' });
  }
  const items = Array.isArray(body?.items) ? body.items : [];
  const weekEnd = computeWeekEndInclusive(weekStart);
  await replaceWeekPlan(user.id, weekStart, weekEnd, items);
  return res.status(204).end();
});

// Generate aggregated grocery list for the user's weekly plan
plannerRouter.get('/week/grocery-list', async (req, res) => {
  const user = (req as any).user;
  const weekStart = String(req.query.weekStart || '').slice(0, 10);
  const includeCost = String(req.query.includeCost ?? 'true') === 'true';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return res.status(400).json({ error: 'weekStart (YYYY-MM-DD) is required' });
  }
  const weekEnd = computeWeekEndInclusive(weekStart);
  const planned = await listPlannedMeals(user.id, weekStart, weekEnd);

  // Collect and scale ingredients across planned meals
  const allIngredients: IngredientItem[] = [];
  for (const pm of planned) {
    const recipe = await getRecipeById(pm.recipe_id);
    if (!recipe) continue;
    const baseServings = recipe.servings ?? 2;
    const servings = pm.servings ?? baseServings;
    const ingredients = (recipe as any).ingredients ?? [];
    if (!Array.isArray(ingredients)) continue;
    const { scaleIngredients } = await import('../services/scaleService.js');
    const scaled = servings !== baseServings ? scaleIngredients(ingredients, baseServings, servings) : ingredients;
    allIngredients.push(...scaled);
  }
  const aggregated = aggregateGroceryList(allIngredients);

  if (includeCost) {
    const { priceGroceryItems } = await import('../services/priceService.js');
    const pricing = await priceGroceryItems(aggregated);
    return res.json({ items: aggregated, pricing });
  }
  return res.json({ items: aggregated });
});