import { Router } from 'express';
import { listRecipes, getRecipe } from '../controllers/recipesController.js';

export const recipesRouter = Router();

recipesRouter.get('/', listRecipes);
recipesRouter.get('/:id', getRecipe);