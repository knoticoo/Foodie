-- Phase 5 monetization schema additions
-- Users: premium flags
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Recipes: sponsorship metadata
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sponsor_name TEXT,
  ADD COLUMN IF NOT EXISTS sponsor_url TEXT;

-- Stores: affiliate template for building outbound links
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS affiliate_url_template TEXT;