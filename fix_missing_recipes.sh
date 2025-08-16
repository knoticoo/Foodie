#!/bin/bash
set -e

echo "=== Fixing Missing Recipes Issue ==="
echo "Starting at $(date)"

cd /workspace

# Check if database is accessible
if ! sudo docker exec recipes_db pg_isready -U recipes >/dev/null 2>&1; then
    echo "Error: Database is not accessible. Please ensure services are running."
    echo "Run: ./start_food_app.sh"
    exit 1
fi

echo "✓ Database is accessible"

# Check current recipe count
current_count=$(sudo docker exec recipes_db psql -U recipes -d recipes -t -c "SELECT COUNT(*) FROM recipes;" 2>/dev/null | tr -d ' ')
echo "Current recipes in database: $current_count"

# Run the seed script
echo "Running database seed script..."
if [[ -f database/init/100_seed.sql ]]; then
    sudo docker exec -i recipes_db psql -U recipes -d recipes < database/init/100_seed.sql
    echo "✓ Seed script executed successfully"
else
    echo "✗ Seed script not found at database/init/100_seed.sql"
    exit 1
fi

# Check new recipe count
new_count=$(sudo docker exec recipes_db psql -U recipes -d recipes -t -c "SELECT COUNT(*) FROM recipes;" 2>/dev/null | tr -d ' ')
echo "Recipes in database after seeding: $new_count"

# Add some additional sample recipes to make the app more interesting
echo "Adding additional sample recipes..."

sudo docker exec -i recipes_db psql -U recipes -d recipes << 'EOF'
INSERT INTO recipes (title, description, steps, images, servings, total_time_minutes, diet, nutrition, cost_cents, ingredients, is_approved)
VALUES 
(
  'Quick Pasta Carbonara',
  'Classic Italian pasta dish with eggs, cheese, and pancetta.',
  '[
    {"step":1,"text":"Cook spaghetti according to package instructions."},
    {"step":2,"text":"Fry pancetta until crispy."},
    {"step":3,"text":"Mix eggs with parmesan cheese."},
    {"step":4,"text":"Combine hot pasta with pancetta and egg mixture."}
  ]'::jsonb,
  '["/images/carbonara.jpg"]'::jsonb,
  2,
  20,
  ARRAY['traditional'],
  '{"calories": 580, "protein_g": 24, "carbs_g": 68, "fat_g": 22}'::jsonb,
  890,
  '[
    {"name":"spaghetti","quantity":200,"unit":"g"},
    {"name":"pancetta","quantity":100,"unit":"g"},
    {"name":"eggs","quantity":2,"unit":"pcs"},
    {"name":"parmesan cheese","quantity":50,"unit":"g"},
    {"name":"black pepper","quantity":2,"unit":"g"}
  ]'::jsonb,
  true
),
(
  'Vegetarian Buddha Bowl',
  'Healthy and colorful bowl with quinoa, vegetables, and tahini dressing.',
  '[
    {"step":1,"text":"Cook quinoa according to package instructions."},
    {"step":2,"text":"Roast vegetables in the oven with olive oil."},
    {"step":3,"text":"Prepare tahini dressing by mixing tahini, lemon juice, and water."},
    {"step":4,"text":"Assemble bowl with quinoa, vegetables, and dressing."}
  ]'::jsonb,
  '["/images/buddha-bowl.jpg"]'::jsonb,
  1,
  35,
  ARRAY['vegetarian','vegan','healthy'],
  '{"calories": 420, "protein_g": 15, "carbs_g": 58, "fat_g": 16}'::jsonb,
  750,
  '[
    {"name":"quinoa","quantity":80,"unit":"g"},
    {"name":"sweet potato","quantity":150,"unit":"g"},
    {"name":"broccoli","quantity":100,"unit":"g"},
    {"name":"chickpeas","quantity":80,"unit":"g"},
    {"name":"tahini","quantity":20,"unit":"g"},
    {"name":"lemon","quantity":1,"unit":"pcs"}
  ]'::jsonb,
  true
),
(
  'Chicken Stir Fry',
  'Quick and healthy chicken stir fry with mixed vegetables.',
  '[
    {"step":1,"text":"Cut chicken into strips and season."},
    {"step":2,"text":"Heat oil in wok or large pan."},
    {"step":3,"text":"Stir fry chicken until cooked through."},
    {"step":4,"text":"Add vegetables and stir fry for 3-4 minutes."},
    {"step":5,"text":"Add sauce and toss everything together."}
  ]'::jsonb,
  '["/images/chicken-stirfry.jpg"]'::jsonb,
  3,
  25,
  ARRAY['high-protein','quick'],
  '{"calories": 320, "protein_g": 28, "carbs_g": 12, "fat_g": 18}'::jsonb,
  650,
  '[
    {"name":"chicken breast","quantity":300,"unit":"g"},
    {"name":"bell peppers","quantity":150,"unit":"g"},
    {"name":"broccoli","quantity":100,"unit":"g"},
    {"name":"soy sauce","quantity":30,"unit":"ml"},
    {"name":"garlic","quantity":2,"unit":"cloves"},
    {"name":"ginger","quantity":10,"unit":"g"}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
EOF

echo "✓ Additional recipes added"

# Final count check
final_count=$(sudo docker exec recipes_db psql -U recipes -d recipes -t -c "SELECT COUNT(*) FROM recipes;" 2>/dev/null | tr -d ' ')
echo "Final recipe count: $final_count"

# Test the API endpoint
echo "Testing API endpoint..."
if curl -s --max-time 5 "http://localhost:3000/api/recipes" >/dev/null 2>&1; then
    recipes_response=$(curl -s --max-time 5 "http://localhost:3000/api/recipes")
    api_count=$(echo "$recipes_response" | grep -o '"recipes":\[[^]]*\]' | grep -o '{' | wc -l)
    echo "✓ API returning $api_count recipes"
else
    echo "⚠ API not responding - recipes may not be visible yet"
fi

echo ""
echo "=== Recipe Fix Complete ==="
echo "✓ Database now contains $final_count recipes"
echo "✓ Recipes should now be visible in the web application"
echo ""
echo "Access your application at:"
echo "  - Public Web: http://localhost/"
echo "  - Admin Web:  http://localhost:5173"