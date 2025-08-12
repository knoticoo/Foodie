CREATE TABLE IF NOT EXISTS cook_history (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cook_history_user_time_idx ON cook_history (user_id, cooked_at DESC);