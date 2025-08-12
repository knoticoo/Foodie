export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string; // e.g., g, kg, ml, l, pcs
}

export interface GroceryLineItem {
  name: string;
  totalQuantity: number;
  unit: string;
}

// Minimal unit conversion map (extend later)
const UNIT_TO_BASE: Record<string, { base: string; factor: number }> = {
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  pcs: { base: 'pcs', factor: 1 }
};

function toBase(quantity: number, unit: string): { base: string; value: number } {
  const spec = UNIT_TO_BASE[unit];
  if (!spec) return { base: unit, value: quantity }; // unknown units: passthrough
  return { base: spec.base, value: quantity * spec.factor };
}

function fromBase(value: number, base: string): { unit: string; value: number } {
  // For now, return the base unit; could pick nicer display units later
  return { unit: base, value };
}

export function aggregateGroceryList(ingredients: IngredientItem[]): GroceryLineItem[] {
  // Group by name + base unit
  const map = new Map<string, { base: string; value: number }>();
  for (const ing of ingredients) {
    const { base, value } = toBase(ing.quantity, ing.unit);
    const key = `${ing.name.toLowerCase()}|${base}`;
    const existing = map.get(key);
    if (existing) {
      existing.value += value;
    } else {
      map.set(key, { base, value });
    }
  }
  // Convert to display items
  const result: GroceryLineItem[] = [];
  for (const [key, { base, value }] of map.entries()) {
    const [name] = key.split('|');
    const display = fromBase(value, base);
    result.push({ name, totalQuantity: Number(display.value.toFixed(2)), unit: display.unit });
  }
  return result;
}