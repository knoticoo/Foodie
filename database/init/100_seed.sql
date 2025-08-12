INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, diet, nutrition, cost_cents, ingredients)
VALUES (
  'Sample Potato Salad',
  'Classic Latvian-style potato salad for 4.',
  '[
    {"step":1,"text":"Boil potatoes until tender."},
    {"step":2,"text":"Chop eggs and pickles."},
    {"step":3,"text":"Mix with mayo, season with salt and pepper."}
  ]'::jsonb,
  '["/images/sample-potato-salad.jpg"]'::jsonb,
  4,
  40,
  ARRAY['traditional','budget'],
  '{"calories": 320, "protein_g": 8, "carbs_g": 45, "fat_g": 12}'::jsonb,
  550,
  '[
    {"name":"potatoes","quantity":800,"unit":"g"},
    {"name":"eggs","quantity":4,"unit":"pcs"},
    {"name":"pickles","quantity":150,"unit":"g"},
    {"name":"mayonnaise","quantity":120,"unit":"g"},
    {"name":"salt","quantity":5,"unit":"g"},
    {"name":"pepper","quantity":2,"unit":"g"}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;