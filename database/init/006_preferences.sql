CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  diet_preferences TEXT[] NOT NULL DEFAULT '{}',
  budget_cents INT
);