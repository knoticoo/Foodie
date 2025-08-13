import type { Request, Response } from 'express';
import { findRecipes, getRecipeById } from '../services/recipesService.js';
import { getUserPreferences } from '../services/preferencesService.js';
import jwt from 'jsonwebtoken';

export async function listRecipes(req: Request, res: Response) {
  const { q, ingredient, diet, maxTime, maxCost, limit, offset, sortBy } = req.query;

  let defaultDiet: string[] | undefined;
  let defaultBudget: number | undefined;

  // If Authorization header is provided and no explicit diet/maxCost filters are set, use user preferences as defaults
  if (!diet && !maxCost && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.slice('Bearer '.length);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { sub: string };
      const prefs = await getUserPreferences(decoded.sub);
      if (prefs.dietPreferences.length > 0) defaultDiet = prefs.dietPreferences;
      if (prefs.budgetCents != null) defaultBudget = prefs.budgetCents;
    } catch {
      // ignore invalid tokens for public listing
    }
  }

  const filters = {
    query: typeof q === 'string' ? q : undefined,
    ingredientQuery: typeof ingredient === 'string' ? ingredient : undefined,
    diet: typeof diet === 'string' ? diet.split(',').filter(Boolean) : defaultDiet,
    maxTimeMinutes: typeof maxTime === 'string' ? Number(maxTime) : undefined,
    maxCostCents: typeof maxCost === 'string' ? Number(maxCost) : defaultBudget,
    sortBy: (sortBy === 'top' || sortBy === 'new') ? (sortBy as 'top' | 'new') : undefined
  };
  const lim = typeof limit === 'string' ? Math.min(Number(limit), 100) : 20;
  const off = typeof offset === 'string' ? Math.max(Number(offset), 0) : 0;
  // Exclude unapproved recipes from public listing
  const recipes = await findRecipes(filters, lim, off);

  // For non-premium users, hide premium-only recipes from the list
  let isPremium = false;
  if (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const { getPremiumStatus } = await import('../middleware/premium.js');
      isPremium = await getPremiumStatus(req);
    } catch {}
  }

  res.json({
    recipes: recipes.filter((r: any) => r.is_approved !== false && (isPremium || r.is_premium_only !== true)),
    limit: lim,
    offset: off
  });
}

export async function getRecipe(req: Request, res: Response) {
  const recipe = await getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
}