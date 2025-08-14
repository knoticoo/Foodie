import { pgPool } from '../db/pool.js';

export interface PricedLineItem {
  name: string;
  totalQuantity: number;
  unit: string;
  storeName: string | null;
  productName: string | null;
  unitPriceCents: number | null; // price per base unit
  estimatedCostCents: number | null;
  affiliateUrl?: string | null;
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

function normalizeUnitInput(unit: string): string {
  const u = String(unit || '').toLowerCase().trim();
  if (u === 'kg') return 'g';
  if (u === 'l') return 'ml';
  if (u === 'gab' || u === 'gab.' || u === 'gabali' || u === 'pc' || u === 'piece' || u === 'pieces') return 'pcs';
  return UNIT_TO_BASE[u]?.base || u;
}

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildNamePatterns(rawName: string): string[] {
  const name = String(rawName || '').toLowerCase().trim();
  const clean = stripDiacritics(name);
  const patterns = new Set<string>();
  const pushLike = (s: string) => { if (s) patterns.add(`%${s}%`); };

  pushLike(name);
  if (clean !== name) pushLike(clean);

  const groups: string[][] = [
    // eggs
    ['egg', 'eggs', 'ola', 'olas', 'olu', 'olam'],
    // potatoes
    ['potato', 'potatoes', 'kartupel', 'kartupeli', 'kartupelis', 'kartupelu'],
    // sugar
    ['sugar', 'cukurs'],
    // salt
    ['salt', 'sals', 'sāls'],
    // oil
    ['oil', 'olive oil', 'ella', 'eļļa'],
    // milk
    ['milk', 'piens'],
    // flour
    ['flour', 'milti'],
    // rice
    ['rice', 'risi', 'rīsi'],
    // chicken
    ['chicken', 'vista'],
    // pork
    ['pork', 'cuka', 'cūka'],
    // butter
    ['butter', 'sviests'],
    // cheese
    ['cheese', 'siers', 'siera'],
    // tomato
    ['tomato', 'tomats', 'tomāts'],
    // bread
    ['bread', 'maize']
  ];

  for (const group of groups) {
    const groupClean = group.map(stripDiacritics);
    if (group.some(w => name.includes(w)) || groupClean.some(w => clean.includes(w))) {
      for (const w of group) { pushLike(w); pushLike(stripDiacritics(w)); }
    }
  }

  // Deduplicate and return
  return Array.from(patterns);
}

export async function findCheapestProduct(ingredientName: string, desiredBaseUnit: string) {
  return getCheapestPerBaseUnit(ingredientName, desiredBaseUnit);
}

async function queryLatestProductsLike(patterns: string[]) {
  const sql = `
    WITH latest_prices AS (
      SELECT DISTINCT ON (product_id) product_id, price_cents, collected_at
      FROM product_prices
      ORDER BY product_id, collected_at DESC
    )
    SELECT s.name AS store_name,
           s.affiliate_url_template,
           p.name AS product_name,
           p.unit,
           p.size_value,
           p.size_unit,
           lp.price_cents
    FROM products p
    JOIN stores s ON s.id = p.store_id
    JOIN latest_prices lp ON lp.product_id = p.id
    WHERE p.name ILIKE ANY($1)
  `;
  const { rows } = await pgPool.query(sql, [patterns]);
  return rows as Array<{ store_name: string; affiliate_url_template: string | null; product_name: string; unit: string; size_value: number; size_unit: string; price_cents: number }>;
}

async function getCheapestPerBaseUnit(ingredientName: string, desiredBaseUnit: string): Promise<{
  storeName: string;
  productName: string;
  unitPriceCents: number; // price per desiredBaseUnit
  packageBaseUnit: string;
  packageBaseSize: number;
} | null> {
  const patterns = buildNamePatterns(ingredientName);
  if (patterns.length === 0) return null;
  const desired = normalizeUnitInput(desiredBaseUnit);
  const rows = await queryLatestProductsLike(patterns);
  if (rows.length === 0) return null;

  let bestPreferred: any = null;
  let bestAny: any = null;

  for (const r of rows) {
    const { value: packageSizeBase, base: packageBaseUnit } = productSizeToBase(Number(r.size_value), r.size_unit);
    if (!packageSizeBase || !Number.isFinite(packageSizeBase) || packageSizeBase <= 0) continue;
    const unitPrice = Math.round(Number(r.price_cents) / packageSizeBase);

    // Track best across all units
    if (!bestAny || unitPrice < bestAny.unitPriceCents) {
      bestAny = {
        storeName: r.store_name as string,
        productName: r.product_name as string,
        unitPriceCents: unitPrice,
        packageBaseUnit,
        packageBaseSize: packageSizeBase
      };
    }

    // Track best among preferred unit
    if (packageBaseUnit === desired) {
      if (!bestPreferred || unitPrice < bestPreferred.unitPriceCents) {
        bestPreferred = {
          storeName: r.store_name as string,
          productName: r.product_name as string,
          unitPriceCents: unitPrice,
          packageBaseUnit,
          packageBaseSize: packageSizeBase
        };
      }
    }
  }

  // Prefer exact unit matches; otherwise fallback to "any" unit
  return bestPreferred || bestAny;
}

export async function compareProductOptions(ingredientName: string, desiredBaseUnit: string): Promise<{
  storeName: string;
  productName: string;
  unitPriceCents: number;
  packageBaseUnit: string;
  packageBaseSize: number;
  affiliateUrl: string | null;
}[]> {
  const patterns = buildNamePatterns(ingredientName);
  const desired = normalizeUnitInput(desiredBaseUnit);
  const rows = await queryLatestProductsLike(patterns);
  const options: {
    storeName: string;
    productName: string;
    unitPriceCents: number;
    packageBaseUnit: string;
    packageBaseSize: number;
    affiliateUrl: string | null;
  }[] = [];

  for (const r of rows) {
    const { value: packageSizeBase, base: packageBaseUnit } = productSizeToBase(Number(r.size_value), r.size_unit);
    if (!packageSizeBase || !Number.isFinite(packageSizeBase) || packageSizeBase <= 0) continue;
    const unitPrice = Math.round(Number(r.price_cents) / packageSizeBase);
    const template: string | null = (r as any).affiliate_url_template ?? null;
    const affiliateUrl = template ? buildAffiliateUrl(template, ingredientName) : null;

    // Include exact unit matches first; we'll sort to prefer these later
    options.push({
      storeName: (r as any).store_name,
      productName: (r as any).product_name,
      unitPriceCents: unitPrice,
      packageBaseUnit,
      packageBaseSize: packageSizeBase,
      affiliateUrl
    });
  }

  // Prefer options matching desired unit, but do not exclude others entirely
  options.sort((a, b) => {
    const aPref = a.packageBaseUnit === desired ? 0 : 1;
    const bPref = b.packageBaseUnit === desired ? 0 : 1;
    if (aPref !== bPref) return aPref - bPref;
    return a.unitPriceCents - b.unitPriceCents;
  });
  return options;
}

function buildAffiliateUrl(template: string, query: string): string {
  try {
    return template.replace('{query}', encodeURIComponent(query));
  } catch {
    return template;
  }
}

// Also include affiliateUrl in priced lines where available
async function getStoreAffiliateTemplateByName(storeName: string): Promise<string | null> {
  const { rows } = await pgPool.query('SELECT affiliate_url_template FROM stores WHERE name = $1', [storeName]);
  return rows[0]?.affiliate_url_template ?? null;
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
        estimatedCostCents: null,
        affiliateUrl: null
      });
      continue;
    }
    const estimated = Math.round(cheapest.unitPriceCents * value);
    total += estimated;
    const template = await getStoreAffiliateTemplateByName(cheapest.storeName);
    const affiliateUrl = template ? buildAffiliateUrl(template, item.name) : null;
    lines.push({
      name: item.name,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      storeName: cheapest.storeName,
      productName: cheapest.productName,
      unitPriceCents: cheapest.unitPriceCents,
      estimatedCostCents: estimated,
      affiliateUrl
    });
  }

  return { lines, totalCents: total };
}