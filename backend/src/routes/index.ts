import { Router } from 'express';
import { healthRouter } from './health.js';
import { recipesRouter } from './recipes.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/recipes', recipesRouter);