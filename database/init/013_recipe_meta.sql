-- Optional metadata for recipes
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT;