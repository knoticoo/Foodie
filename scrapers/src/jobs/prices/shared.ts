import { withClient } from '../../db.js';

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