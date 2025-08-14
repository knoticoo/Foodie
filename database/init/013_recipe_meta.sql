-- Optional metadata for recipes
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- Optional: prep/cook time discrete fields used by UI (safe if already exist)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS prep_time_minutes INT,
  ADD COLUMN IF NOT EXISTS cook_time_minutes INT;