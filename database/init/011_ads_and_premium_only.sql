-- Phase 5 continued: Ads and premium-only content

-- Recipes: premium-only visibility
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN NOT NULL DEFAULT FALSE;

-- Users: external billing linkages (Stripe)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Ads table
CREATE TABLE IF NOT EXISTS ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement TEXT NOT NULL, -- e.g., 'home_top', 'recipe_detail_inline'
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_slots_active_idx ON ad_slots (placement, is_active);