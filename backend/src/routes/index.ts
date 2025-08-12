import { Router } from 'express';
import { healthRouter } from './health.js';
import { recipesRouter } from './recipes.js';
import { authRouter } from './auth.js';
import { favoritesRouter } from './favorites.js';
import { pricesRouter } from './prices.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/recipes', recipesRouter);
router.use('/auth', authRouter);
router.use('/favorites', favoritesRouter);
router.use('/prices', pricesRouter);