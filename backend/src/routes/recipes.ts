import { Router } from 'express';
import { listRecipes, getRecipe } from '../controllers/recipesController.js';
import { aggregateGroceryList } from '../services/groceryService.js';
import { getRecipeById } from '../services/recipesService.js';
import { scaleIngredients } from '../services/scaleService.js';

export const recipesRouter = Router();

// List recipes with filters
recipesRouter.get('/', listRecipes);

// Get single recipe by id
recipesRouter.get('/:id', getRecipe);

// Get aggregated grocery list for a recipe
recipesRouter.get('/:id/grocery-list', async (req, res) => {
  const recipe = await getRecipeById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  const ingredients = (recipe as any).ingredients ?? [];
  const aggregated = aggregateGroceryList(ingredients);
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
  const body = req.body as { recipes: { id: string; servings?: number }[] };
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
  res.json({ items: aggregated });
});