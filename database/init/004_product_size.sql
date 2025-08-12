ALTER TABLE products
  ADD COLUMN IF NOT EXISTS size_value NUMERIC NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS size_unit TEXT NOT NULL DEFAULT 'pcs';

-- Optional but useful indexes
CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);
CREATE INDEX IF NOT EXISTS product_prices_collected_at_idx ON product_prices (collected_at);