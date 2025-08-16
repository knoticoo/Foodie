-- Advanced Database Performance Optimizations for Virtuves Māksla
-- Run this after your regular database setup
-- Author: Performance Engineering Team
-- Last Updated: 2024

-- ===========================================
-- SEARCH & FILTERING INDEXES
-- ===========================================

-- Full-text search for recipes (title + description + ingredients)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_search_comprehensive
    ON recipes USING gin(to_tsvector('english', 
        title || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(array_to_string(ingredients, ' '), '')
    ));

-- Category-based filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_category
    ON recipes(category) WHERE category IS NOT NULL;

-- Cooking time filtering (common search filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_cook_time
    ON recipes(cook_time) WHERE cook_time IS NOT NULL;

-- Difficulty filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_difficulty
    ON recipes(difficulty) WHERE difficulty IS NOT NULL;

-- Combined filters for common search patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_category_time_approved
    ON recipes(category, cook_time, is_approved) WHERE is_approved = true;

-- Dietary restrictions (assuming JSON column)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_dietary_gin
    ON recipes USING gin(dietary_tags) WHERE dietary_tags IS NOT NULL;

-- ===========================================
-- CONTENT & ENGAGEMENT INDEXES
-- ===========================================

-- Recipe approval status with created date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_approved_created
    ON recipes(is_approved, created_at DESC) WHERE is_approved = true;

-- Recipe ratings for sorting by popularity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_avg_rating
    ON recipes(average_rating DESC NULLS LAST) WHERE average_rating IS NOT NULL;

-- Recipe view count for trending
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_view_count
    ON recipes(view_count DESC) WHERE view_count > 0;

-- Recent recipes (last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_recent
    ON recipes(created_at DESC) WHERE created_at > NOW() - INTERVAL '30 days';

-- ===========================================
-- USER ENGAGEMENT INDEXES
-- ===========================================

-- User favorites with recipe info
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_created
    ON favorites(user_id, created_at DESC);

-- Recipe favorites count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_recipe_count
    ON favorites(recipe_id);

-- User ratings with timestamp
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_ratings_user_recipe
    ON recipe_ratings(user_id, recipe_id, created_at DESC);

-- Recipe ratings for average calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_ratings_recipe_rating
    ON recipe_ratings(recipe_id, rating);

-- ===========================================
-- COMMENTS & MODERATION INDEXES
-- ===========================================

-- Recipe comments with moderation status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_comments_recipe_approved
    ON recipe_comments(recipe_id, is_approved, created_at DESC);

-- User comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_comments_user
    ON recipe_comments(user_id, created_at DESC);

-- Pending comments for moderation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_comments_pending
    ON recipe_comments(created_at DESC) WHERE is_approved = false;

-- ===========================================
-- USER MANAGEMENT INDEXES
-- ===========================================

-- User login (email lookup)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique
    ON users(LOWER(email));

-- Active users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active
    ON users(is_active, last_login DESC) WHERE is_active = true;

-- User roles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role
    ON users(role) WHERE role IS NOT NULL;

-- ===========================================
-- SHOPPING & PRICING INDEXES
-- ===========================================

-- Product prices with latest date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_product_latest
    ON product_prices(product_id, date_updated DESC, price);

-- Store-specific pricing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_store_date
    ON product_prices(store_id, date_updated DESC);

-- Price history for trending
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_product_trend
    ON product_prices(product_id, date_updated) 
    WHERE date_updated > NOW() - INTERVAL '90 days';

-- Shopping lists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shopping_lists_user
    ON shopping_lists(user_id, created_at DESC);

-- ===========================================
-- PERFORMANCE MONITORING INDEXES
-- ===========================================

-- API request logging
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_logs_endpoint_time
    ON api_request_logs(endpoint, created_at DESC);

-- Error tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_level_time
    ON error_logs(error_level, created_at DESC);

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_user_time
    ON user_activity_logs(user_id, created_at DESC);

-- ===========================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ===========================================

-- Recipe search with filters (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_search_filters
    ON recipes(is_approved, category, cook_time, difficulty, average_rating DESC)
    WHERE is_approved = true;

-- User engagement summary
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_engagement
    ON recipes(user_id, is_approved, created_at DESC)
    WHERE is_approved = true;

-- Trending recipes (views + ratings + recency)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_trending
    ON recipes(view_count DESC, average_rating DESC, created_at DESC)
    WHERE is_approved = true AND created_at > NOW() - INTERVAL '7 days';

-- ===========================================
-- PARTIAL INDEXES FOR EFFICIENCY
-- ===========================================

-- Only index published recipes for public queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_public_title
    ON recipes(title) WHERE is_approved = true AND is_public = true;

-- Only index recipes with images for featured content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_with_images
    ON recipes(average_rating DESC, created_at DESC)
    WHERE is_approved = true AND image_url IS NOT NULL;

-- Only index premium users for premium features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_premium
    ON users(subscription_end_date)
    WHERE subscription_type = 'premium' AND subscription_end_date > NOW();

-- ===========================================
-- UPDATE STATISTICS
-- ===========================================

-- Update table statistics for query planner
ANALYZE recipes;
ANALYZE recipe_ratings;
ANALYZE recipe_comments;
ANALYZE favorites;
ANALYZE users;
ANALYZE product_prices;
ANALYZE shopping_lists;

-- ===========================================
-- CONFIGURATION OPTIMIZATIONS
-- ===========================================

-- Enable query logging for slow queries (adjust threshold as needed)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries taking > 1s
-- ALTER SYSTEM SET log_statement = 'mod'; -- Log DDL and DML
-- ALTER SYSTEM SET log_checkpoints = on;
-- ALTER SYSTEM SET log_connections = on;
-- ALTER SYSTEM SET log_disconnections = on;

-- Optimize for read-heavy workload
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET random_page_cost = 1.1;

-- SELECT pg_reload_conf();

-- ===========================================
-- MAINTENANCE FUNCTIONS
-- ===========================================

-- Create function to update recipe statistics
CREATE OR REPLACE FUNCTION update_recipe_statistics()
RETURNS void AS $$
BEGIN
    -- Update average ratings
    UPDATE recipes SET 
        average_rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM recipe_ratings 
            WHERE recipe_id = recipes.id
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM recipe_ratings 
            WHERE recipe_id = recipes.id
        ),
        favorite_count = (
            SELECT COUNT(*) 
            FROM favorites 
            WHERE recipe_id = recipes.id
        ),
        comment_count = (
            SELECT COUNT(*) 
            FROM recipe_comments 
            WHERE recipe_id = recipes.id AND is_approved = true
        );
        
    -- Update user statistics
    UPDATE users SET
        recipe_count = (
            SELECT COUNT(*) 
            FROM recipes 
            WHERE user_id = users.id AND is_approved = true
        ),
        total_favorites = (
            SELECT COUNT(*) 
            FROM favorites 
            WHERE user_id = users.id
        );
END;
$$ LANGUAGE plpgsql;

-- Function to clean old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Clean old API logs (keep 90 days)
    DELETE FROM api_request_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean old error logs (keep 30 days)
    DELETE FROM error_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Clean old user activity (keep 180 days)
    DELETE FROM user_activity_logs 
    WHERE created_at < NOW() - INTERVAL '180 days';
    
    -- Clean old price history (keep 1 year)
    DELETE FROM product_prices 
    WHERE date_updated < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum and analyze tables
CREATE OR REPLACE FUNCTION maintenance_vacuum()
RETURNS void AS $$
BEGIN
    -- Vacuum and analyze main tables
    VACUUM ANALYZE recipes;
    VACUUM ANALYZE recipe_ratings;
    VACUUM ANALYZE recipe_comments;
    VACUUM ANALYZE favorites;
    VACUUM ANALYZE users;
    VACUUM ANALYZE product_prices;
    
    -- Reindex if needed (run during low traffic)
    -- REINDEX INDEX CONCURRENTLY idx_recipes_search_comprehensive;
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance tasks (requires pg_cron extension)
-- SELECT cron.schedule('update-recipe-stats', '0 2 * * *', 'SELECT update_recipe_statistics();');
-- SELECT cron.schedule('cleanup-old-data', '0 3 * * 0', 'SELECT cleanup_old_data();');
-- SELECT cron.schedule('maintenance-vacuum', '0 4 * * 0', 'SELECT maintenance_vacuum();');

-- ===========================================
-- MONITORING VIEWS
-- ===========================================

-- View for slow queries
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
    query,
    mean_time,
    calls,
    total_time,
    (mean_time * calls) as total_time_calc,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE calls > 100
ORDER BY mean_time DESC;

-- View for index usage
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 10 THEN 'Rarely used'
        WHEN idx_scan < 100 THEN 'Sometimes used'
        ELSE 'Frequently used'
    END as usage_status
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- View for table sizes
CREATE OR REPLACE VIEW v_table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    pg_stat_get_live_tuples(oid) as live_tuples,
    pg_stat_get_dead_tuples(oid) as dead_tuples
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===========================================
-- PERFORMANCE TESTING QUERIES
-- ===========================================

-- Test recipe search performance
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT id, title, average_rating, view_count 
-- FROM recipes 
-- WHERE is_approved = true 
--   AND to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', 'pasta chicken')
--   AND cook_time <= 60
--   AND category = 'Pusdienas'
-- ORDER BY average_rating DESC, view_count DESC
-- LIMIT 20;

-- Test user favorites query
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT r.id, r.title, r.average_rating, f.created_at
-- FROM recipes r
-- JOIN favorites f ON r.id = f.recipe_id
-- WHERE f.user_id = 123
-- ORDER BY f.created_at DESC
-- LIMIT 50;

-- ===========================================
-- FINAL CHECKS
-- ===========================================

-- Check if all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Summary of optimization
DO $$
BEGIN
    RAISE NOTICE 'Database optimization completed successfully!';
    RAISE NOTICE 'Created indexes for: search, filtering, user engagement, comments, pricing';
    RAISE NOTICE 'Added maintenance functions: update_recipe_statistics, cleanup_old_data, maintenance_vacuum';
    RAISE NOTICE 'Created monitoring views: v_slow_queries, v_index_usage, v_table_sizes';
    RAISE NOTICE 'Next steps: Monitor query performance and adjust as needed';
END $$;