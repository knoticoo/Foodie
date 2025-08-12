import { pgPool } from '../db/pool.js';

export interface PricedLineItem {
  name: string;
  totalQuantity: number;
  unit: string;
  storeName: string | null;
  productName: string | null;
  unitPriceCents: number | null; // price per base unit
  estimatedCostCents: number | null;
}

const UNIT_TO_BASE: Record<string, { base: string; factor: number }> = {
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  pcs: { base: 'pcs', factor: 1 }
};

function toBase(quantity: number, unit: string): { base: string; value: number } {
  const spec = UNIT_TO_BASE[unit];
  if (!spec) return { base: unit, value: quantity };
  return { base: spec.base, value: quantity * spec.factor };
}

function productSizeToBase(sizeValue: number, sizeUnit: string): { base: string; value: number } {
  const spec = UNIT_TO_BASE[sizeUnit];
  if (!spec) return { base: sizeUnit, value: sizeValue };
  return { base: spec.base, value: sizeValue * spec.factor };
}

export async function findCheapestProduct(ingredientName: string, desiredBaseUnit: string) {
  return getCheapestPerBaseUnit(ingredientName, desiredBaseUnit);
}

async function getCheapestPerBaseUnit(ingredientName: string, desiredBaseUnit: string): Promise<{
  storeName: string;
  productName: string;
  unitPriceCents: number; // price per desiredBaseUnit
  packageBaseUnit: string;
  packageBaseSize: number;
} | null> {
  // Query products matching ingredient name, join latest price
  const sql = `
    WITH latest_prices AS (
      SELECT DISTINCT ON (product_id) product_id, price_cents, collected_at
      FROM product_prices
      ORDER BY product_id, collected_at DESC
    )
    SELECT s.name AS store_name, p.name AS product_name, p.unit, p.size_value, p.size_unit,
           lp.price_cents
    FROM products p
    JOIN stores s ON s.id = p.store_id
    JOIN latest_prices lp ON lp.product_id = p.id
    WHERE p.name ILIKE $1
  `;
  const { rows } = await pgPool.query(sql, [`%${ingredientName}%`]);
  if (rows.length === 0) return null;

  let best: any = null;
  for (const r of rows) {
    const { value: packageSizeBase, base: packageBaseUnit } = productSizeToBase(Number(r.size_value), r.size_unit);
    // Only consider comparable units: match base unit
    if (packageBaseUnit !== desiredBaseUnit) {
      // allow pcs when desired is pcs; else skip mismatched bases
      if (!(packageBaseUnit === 'pcs' && desiredBaseUnit === 'pcs')) continue;
    }
    const unitPrice = Math.round(Number(r.price_cents) / packageSizeBase);
    if (!best || unitPrice < best.unitPriceCents) {
      best = {
        storeName: r.store_name as string,
        productName: r.product_name as string,
        unitPriceCents: unitPrice,
        packageBaseUnit,
        packageBaseSize: packageSizeBase
      };
    }
  }
  return best;
}

export async function priceGroceryItems(items: { name: string; totalQuantity: number; unit: string }[]): Promise<{ lines: PricedLineItem[]; totalCents: number }>{
  const lines: PricedLineItem[] = [];
  let total = 0;

  for (const item of items) {
    const { base, value } = toBase(item.totalQuantity, item.unit);
    const cheapest = await getCheapestPerBaseUnit(item.name, base);
    if (!cheapest) {
      lines.push({
        name: item.name,
        totalQuantity: item.totalQuantity,
        unit: item.unit,
        storeName: null,
        productName: null,
        unitPriceCents: null,
        estimatedCostCents: null
      });
      continue;
    }
    const estimated = Math.round(cheapest.unitPriceCents * value);
    total += estimated;
    lines.push({
      name: item.name,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      storeName: cheapest.storeName,
      productName: cheapest.productName,
      unitPriceCents: cheapest.unitPriceCents,
      estimatedCostCents: estimated
    });
  }

  return { lines, totalCents: total };
}