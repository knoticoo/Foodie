import { Router } from 'express';
import { listRecipes, getRecipe } from '../controllers/recipesController.js';
import { aggregateGroceryList } from '../services/groceryService.js';
import { getRecipeById } from '../services/recipesService.js';

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