import type { IngredientItem } from './groceryService.js';

export function scaleIngredients(ingredients: IngredientItem[], originalServings: number, newServings: number): IngredientItem[] {
  if (originalServings <= 0 || newServings <= 0) return ingredients;
  const factor = newServings / originalServings;
  return ingredients.map(i => ({ ...i, quantity: Number((i.quantity * factor).toFixed(2)) }));
}