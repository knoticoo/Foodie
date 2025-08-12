ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS servings INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS total_time_minutes INT,
  ADD COLUMN IF NOT EXISTS diet TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cost_cents INT;

CREATE INDEX IF NOT EXISTS recipes_title_idx ON recipes (title);
CREATE INDEX IF NOT EXISTS recipes_diet_gin ON recipes USING GIN (diet);