import type { Request, Response } from 'express';
import { findRecipes, getRecipeById } from '../services/recipesService.js';

export async function listRecipes(req: Request, res: Response) {
  const { q, diet, maxTime, maxCost, limit, offset } = req.query;
  const filters = {
    query: typeof q === 'string' ? q : undefined,
    diet: typeof diet === 'string' ? diet.split(',').filter(Boolean) : undefined,
    maxTimeMinutes: typeof maxTime === 'string' ? Number(maxTime) : undefined,
    maxCostCents: typeof maxCost === 'string' ? Number(maxCost) : undefined
  };
  const lim = typeof limit === 'string' ? Math.min(Number(limit), 100) : 20;
  const off = typeof offset === 'string' ? Math.max(Number(offset), 0) : 0;
  const recipes = await findRecipes(filters, lim, off);
  res.json({ recipes, limit: lim, offset: off });
}

export async function getRecipe(req: Request, res: Response) {
  const recipe = await getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
}