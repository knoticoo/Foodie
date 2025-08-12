-- Community features for Phase 4
-- Add author and approval fields to recipes, plus share token
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Ensure share_token has a default for new rows and backfill existing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'recipes'::regclass AND attname = 'share_token' AND attgenerated = ''
  ) THEN
    -- Set default if not already set
    EXECUTE 'ALTER TABLE recipes ALTER COLUMN share_token SET DEFAULT gen_random_uuid()::text';
  END IF;
END $$;

UPDATE recipes SET share_token = gen_random_uuid()::text WHERE share_token IS NULL;

-- Recipe ratings (1-5) with optional comments
CREATE TABLE IF NOT EXISTS recipe_ratings (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS recipe_ratings_recipe_idx ON recipe_ratings (recipe_id);

-- Seasonal challenges scaffolding
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_recipes (
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  PRIMARY KEY (challenge_id, recipe_id)
);