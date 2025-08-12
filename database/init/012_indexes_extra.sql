-- Index to speed up ingredient name search
CREATE INDEX IF NOT EXISTS recipes_ingredients_name_gin
ON recipes
USING GIN ((jsonb_path_query_array(ingredients, '$[*].name')::jsonb));