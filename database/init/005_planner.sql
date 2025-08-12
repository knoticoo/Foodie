CREATE TABLE IF NOT EXISTS planned_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  meal_slot TEXT NOT NULL, -- e.g., breakfast, lunch, dinner, snack
  servings INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planned_meals_user_date_idx ON planned_meals (user_id, planned_date);
CREATE INDEX IF NOT EXISTS planned_meals_user_slot_idx ON planned_meals (user_id, meal_slot);