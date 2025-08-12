import type { Request, Response } from 'express';

export async function listRecipes(_req: Request, res: Response) {
  res.json({ recipes: [], total: 0 });
}

export async function getRecipe(_req: Request, res: Response) {
  res.json({ id: _req.params.id, title: 'Placeholder', steps: [], ingredients: [] });
}