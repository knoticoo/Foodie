import { withClient } from '../../db.js';
import { load as loadHtml } from 'cheerio';
import { request } from 'undici';

export interface ProductInput {
  name: string;
  unit: string; // e.g., g, ml, pcs
  sizeValue: number;
  sizeUnit: string; // e.g., g, ml, pcs
  priceCents: number;
}

export async function upsertStore(name: string): Promise<number> {
  return withClient(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO stores(name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name]
    );
    return rows[0].id as number;
  });
}

export async function upsertProduct(storeId: number, name: string, unit: string, sizeValue: number, sizeUnit: string): Promise<string> {
  return withClient(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO products(store_id, name, unit, size_value, size_unit)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (store_id, name) DO UPDATE SET unit = EXCLUDED.unit, size_value = EXCLUDED.size_value, size_unit = EXCLUDED.size_unit
       RETURNING id`,
      [storeId, name, unit, sizeValue, sizeUnit]
    );
    return rows[0].id as string;
  });
}

export async function insertPrice(productId: string, priceCents: number, date: string): Promise<void> {
  return withClient(async (client) => {
    await client.query(
      `INSERT INTO product_prices(product_id, price_cents, collected_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, collected_at) DO UPDATE SET price_cents = EXCLUDED.price_cents`,
      [productId, priceCents, date]
    );
  });
}

export async function updateStorePrices(storeName: string, products: ProductInput[]): Promise<void> {
  const storeId = await upsertStore(storeName);
  const today = new Date().toISOString().slice(0, 10);
  for (const p of products) {
    const productId = await upsertProduct(storeId, p.name, p.unit, p.sizeValue, p.sizeUnit);
    await insertPrice(productId, p.priceCents, today);
  }
}

// Basic parser for ld+json Product schema on store search pages
function parseSizeFromName(name: string): { unit: string; sizeValue: number; sizeUnit: string } {
  const lower = name.toLowerCase();
  const matchG = /(\d+[\.,]?\d*)\s*(g|kg)/.exec(lower);
  const matchMl = /(\d+[\.,]?\d*)\s*(ml|l)/.exec(lower);
  const matchPcs = /(\d+)\s*(gab|pcs|x)/.exec(lower);
  if (matchG) {
    const val = Number(matchG[1].replace(',', '.'));
    if (matchG[2] === 'kg') return { unit: 'g', sizeValue: Math.round(val * 1000), sizeUnit: 'g' };
    return { unit: 'g', sizeValue: Math.round(val), sizeUnit: 'g' };
  }
  if (matchMl) {
    const val = Number(matchMl[1].replace(',', '.'));
    if (matchMl[2] === 'l') return { unit: 'ml', sizeValue: Math.round(val * 1000), sizeUnit: 'ml' };
    return { unit: 'ml', sizeValue: Math.round(val), sizeUnit: 'ml' };
  }
  if (matchPcs) {
    return { unit: 'pcs', sizeValue: Number(matchPcs[1]), sizeUnit: 'pcs' };
  }
  // fallback single unit
  return { unit: 'g', sizeValue: 1000, sizeUnit: 'g' };
}

async function fetchHtml(url: string): Promise<string> {
  const res = await request(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)' } });
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return await res.body.text();
  }
  throw new Error(`Failed to fetch ${url} (${res.statusCode})`);
}

export async function scrapeSearchLdJson(storeName: string, searchUrlTemplate: string, queries: string[]): Promise<ProductInput[]> {
  const products: ProductInput[] = [];
  for (const q of queries) {
    const url = searchUrlTemplate.replace('{query}', encodeURIComponent(q));
    try {
      const html = await fetchHtml(url);
      const $ = loadHtml(html);
      const scripts = $('script[type="application/ld+json"]').toArray();
      for (const el of scripts) {
        const text = $(el).contents().text();
        try {
          const json = JSON.parse(text);
          const items = Array.isArray(json) ? json : [json];
          for (const item of items) {
            const type = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
            if (type && type.includes('Product')) {
              const name = String(item.name || '').trim();
              const offers = item.offers || {};
              const price = Number(offers.price || offers.priceSpecification?.price || 0);
              if (!name || !Number.isFinite(price) || price <= 0) continue;
              const size = parseSizeFromName(name);
              products.push({
                name,
                unit: size.unit,
                sizeValue: size.sizeValue,
                sizeUnit: size.sizeUnit,
                priceCents: Math.round(price * 100)
              });
            }
          }
        } catch {}
      }
    } catch (e) {
      // ignore individual query failures
    }
  }
  return products;
}

export const DEFAULT_QUERIES = [
  'kartupeli', 'olam', 'cukurs', 'sals', 'ella', 'piens', 'sviests', 'milti', 'risi', 'vista', 'cuka', 'siera', 'sogijs',
  'potatoes', 'eggs', 'sugar', 'salt', 'oil', 'milk', 'butter', 'flour', 'rice', 'chicken', 'beef', 'pork', 'onion', 'tomato', 'bread'
];