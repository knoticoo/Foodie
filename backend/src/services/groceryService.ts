export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string; // e.g., g, kg, ml, l, pcs, cup, tbsp, tsp
}

export interface GroceryLineItem {
  name: string;
  totalQuantity: number;
  unit: string;
}

// Density map to translate volume (ml) to mass (g) for common ingredients
// Values are grams per milliliter (approximate). Keys are matched case-insensitively by inclusion.
const DENSITY_G_PER_ML: Record<string, number> = {
  // powders / dry goods
  'all-purpose flour': 0.52,
  'flour': 0.52,
  'granulated sugar': 0.85,
  'sugar': 0.85,
  'brown sugar': 0.73,
  'cocoa powder': 0.45,
  'rice': 0.85,
  'oats': 0.38,
  // liquids
  'water': 1.0,
  'milk': 1.03,
  'olive oil': 0.91,
  'oil': 0.91,
  'honey': 1.42,
  // fats
  'butter': 0.911,
  'margarine': 0.90
};

// Unit conversion map including cups/tbsp/tsp to ml
const UNIT_TO_BASE: Record<string, { base: string; factor: number }> = {
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  cup: { base: 'ml', factor: 240 },
  tbsp: { base: 'ml', factor: 15 },
  tsp: { base: 'ml', factor: 5 },
  pcs: { base: 'pcs', factor: 1 }
};

function normalizeUnit(unit: string): string {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'gram' || u === 'grams') return 'g';
  if (u === 'kilogram' || u === 'kilograms' || u === 'kgs') return 'kg';
  if (u === 'liter' || u === 'liters') return 'l';
  if (u === 'teaspoon' || u === 'teaspoons') return 'tsp';
  if (u === 'tablespoon' || u === 'tablespoons') return 'tbsp';
  if (u === 'cups') return 'cup';
  if (u === 'piece' || u === 'pieces') return 'pcs';
  return u;
}

function toBaseWithName(name: string, quantity: number, unit: string): { base: string; value: number } {
  const normUnit = normalizeUnit(unit);
  const spec = UNIT_TO_BASE[normUnit];
  if (!spec) return { base: normUnit, value: quantity };

  // Convert to base (ml / g / pcs)
  const base = spec.base;
  const mlOrG = quantity * spec.factor;

  // If base is ml and density exists for this ingredient, convert volume→mass to standardize aggregation
  if (base === 'ml') {
    const key = name.toLowerCase();
    const found = Object.entries(DENSITY_G_PER_ML).find(([k]) => key.includes(k));
    if (found) {
      const gPerMl = found[1];
      return { base: 'g', value: mlOrG * gPerMl };
    }
  }

  return { base, value: mlOrG };
}

function fromBase(value: number, base: string): { unit: string; value: number } {
  // Keep base units for display; improving pretty-print is out of scope here
  return { unit: base, value };
}

export function aggregateGroceryList(ingredients: IngredientItem[]): GroceryLineItem[] {
  const map = new Map<string, { base: string; value: number }>();
  for (const ing of ingredients) {
    const { base, value } = toBaseWithName(ing.name, ing.quantity, ing.unit);
    const key = `${ing.name.toLowerCase()}|${base}`;
    const existing = map.get(key);
    if (existing) {
      existing.value += value;
    } else {
      map.set(key, { base, value });
    }
  }

  const result: GroceryLineItem[] = [];
  for (const [key, { base, value }] of map.entries()) {
    const [name] = key.split('|');
    const display = fromBase(value, base);
    result.push({ name, totalQuantity: Number(display.value.toFixed(2)), unit: display.unit });
  }
  return result;
}