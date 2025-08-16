import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';
import { findRecipes } from '../services/recipesService.js';
import { cacheManager, cacheMiddleware, recipeCache, searchCache } from '../middleware/cache.js';

export const recipesRouter = Router();

// Initialize cache on startup
cacheManager.connect().catch(console.error);

// Get all recipes with caching (30 minutes cache)
recipesRouter.get('/', cacheMiddleware(1800), async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const sortBy = (req.query.sortBy === 'top' || req.query.sortBy === 'new') ? (req.query.sortBy as 'top' | 'new') : 'new';
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;
    const limit = typeof req.query.limit === 'string' ? Math.min(Number(req.query.limit), 100) : 20;
    const offset = typeof req.query.offset === 'string' ? Math.max(Number(req.query.offset), 0) : 0;
    const page = Math.floor(offset / limit) + 1;

    // Build filters object for cache key
    const filters: { [key: string]: any } = { sortBy, category, difficulty };
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    // Try cache first for search queries
    if (q) {
      const cached = await searchCache.get(q, filters);
      if (cached) {
        return res.json(cached);
      }
    } else {
      // Try cache for list queries
      const cached = await cacheManager.getRecipesList(page, limit, filters);
      if (cached) {
        return res.json(cached);
      }
    }

    // Database query
    let query = `
      SELECT 
        r.*,
        u.name as author_name,
        u.email as author_email,
        COALESCE(AVG(rr.rating), 0) as average_rating,
        COUNT(DISTINCT rr.id) as rating_count,
        COUNT(DISTINCT f.id) as favorite_count,
        COUNT(DISTINCT rc.id) as comment_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id AND rc.is_approved = true
      WHERE r.is_approved = true
    `;

    const queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (q) {
      paramCount++;
      query += ` AND (
        r.title ILIKE $${paramCount} OR 
        r.description ILIKE $${paramCount} OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(r.ingredients) AS ingredient 
          WHERE ingredient ILIKE $${paramCount}
        )
      )`;
      queryParams.push(`%${q}%`);
    }

    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND r.category = $${paramCount}`;
      queryParams.push(category);
    }

    // Add difficulty filter
    if (difficulty) {
      paramCount++;
      query += ` AND r.difficulty = $${paramCount}`;
      queryParams.push(difficulty);
    }

    query += ` GROUP BY r.id, u.name, u.email`;

    // Add sorting
    switch (sortBy) {
      case 'top':
        query += ` ORDER BY average_rating DESC, favorite_count DESC, r.created_at DESC`;
        break;
      case 'new':
      default:
        query += ` ORDER BY r.created_at DESC`;
        break;
    }

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const { rows } = await pgPool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM recipes r
      WHERE r.is_approved = true
    `;

    const countParams = [];
    let countParamCount = 0;

    if (q) {
      countParamCount++;
      countQuery += ` AND (
        r.title ILIKE $${countParamCount} OR 
        r.description ILIKE $${countParamCount} OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(r.ingredients) AS ingredient 
          WHERE ingredient ILIKE $${countParamCount}
        )
      )`;
      countParams.push(`%${q}%`);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND r.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (difficulty) {
      countParamCount++;
      countQuery += ` AND r.difficulty = $${countParamCount}`;
      countParams.push(difficulty);
    }

    const countResult = await pgPool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const result = {
      data: rows,
      pagination: {
        page,
        limit,
        offset,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    // Cache the results
    if (q) {
      await searchCache.set(q, filters, result);
    } else {
      await cacheManager.setRecipesList(page, limit, filters, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single recipe with caching (2 hours cache)
recipesRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Try cache first
    const cached = await recipeCache.get(id);
    if (cached) {
      console.log(`✅ Recipe cache hit: ${id}`);
      return res.json(cached);
    }

    console.log(`❌ Recipe cache miss: ${id}`);

    const { rows } = await pgPool.query(`
      SELECT 
        r.*,
        u.name as author_name,
        u.email as author_email,
        COALESCE(AVG(rr.rating), 0) as average_rating,
        COUNT(DISTINCT rr.id) as rating_count,
        COUNT(DISTINCT f.id) as favorite_count,
        COUNT(DISTINCT rc.id) as comment_count,
        array_agg(DISTINCT jsonb_build_object(
          'id', rc.id,
          'content', rc.content,
          'rating', rc.rating,
          'user_name', cu.name,
          'created_at', rc.created_at
        )) FILTER (WHERE rc.id IS NOT NULL AND rc.is_approved = true) as comments
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id AND rc.is_approved = true
      LEFT JOIN users cu ON rc.user_id = cu.id
      WHERE r.id = $1 AND r.is_approved = true
      GROUP BY r.id, u.name, u.email
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = rows[0];

    // Increment view count
    await pgPool.query(
      'UPDATE recipes SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
      [id]
    );

    // Cache the recipe
    await recipeCache.set(id, recipe);

    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recipe (requires auth)
recipesRouter.post('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      ingredients,
      steps,
      category,
      difficulty,
      servings,
      total_time_minutes,
      nutrition,
      images
    } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title is required and must be at least 3 characters' });
    }

    const { rows } = await pgPool.query(`
      INSERT INTO recipes (
        user_id, title, description, ingredients, steps, category, 
        difficulty, servings, total_time_minutes, nutrition, images, is_approved
      ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10::jsonb, $11::jsonb, false)
      RETURNING id
    `, [
      userId,
      title.trim(),
      description || '',
      JSON.stringify(ingredients || []),
      JSON.stringify(steps || []),
      category || null,
      difficulty || 'easy',
      servings || 2,
      total_time_minutes || null,
      JSON.stringify(nutrition || {}),
      JSON.stringify(images || [])
    ]);

    const recipeId = rows[0].id;

    // Invalidate recipes list cache
    await cacheManager.invalidateRecipesList();

    res.status(201).json({
      id: recipeId,
      message: 'Recipe created successfully and is pending approval'
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recipe (requires auth and ownership)
recipesRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const recipeId = req.params.id;

    // Check ownership
    const { rows: ownershipRows } = await pgPool.query(
      'SELECT user_id FROM recipes WHERE id = $1',
      [recipeId]
    );

    if (ownershipRows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (ownershipRows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own recipes' });
    }

    const {
      title,
      description,
      ingredients,
      steps,
      category,
      difficulty,
      servings,
      total_time_minutes,
      nutrition,
      images
    } = req.body;

    if (title && title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title.trim());
    }

    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }

    if (ingredients !== undefined) {
      paramCount++;
      updates.push(`ingredients = $${paramCount}::jsonb`);
      values.push(JSON.stringify(ingredients));
    }

    if (steps !== undefined) {
      paramCount++;
      updates.push(`steps = $${paramCount}::jsonb`);
      values.push(JSON.stringify(steps));
    }

    if (category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      values.push(category);
    }

    if (difficulty !== undefined) {
      paramCount++;
      updates.push(`difficulty = $${paramCount}`);
      values.push(difficulty);
    }

    if (servings !== undefined) {
      paramCount++;
      updates.push(`servings = $${paramCount}`);
      values.push(servings);
    }

    if (total_time_minutes !== undefined) {
      paramCount++;
      updates.push(`total_time_minutes = $${paramCount}`);
      values.push(total_time_minutes);
    }

    if (nutrition !== undefined) {
      paramCount++;
      updates.push(`nutrition = $${paramCount}::jsonb`);
      values.push(JSON.stringify(nutrition));
    }

    if (images !== undefined) {
      paramCount++;
      updates.push(`images = $${paramCount}::jsonb`);
      values.push(JSON.stringify(images));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // Add recipe ID for WHERE clause
    paramCount++;
    values.push(recipeId);

    await pgPool.query(
      `UPDATE recipes SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    // Invalidate caches
    await recipeCache.delete(recipeId);

    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recipe (requires auth and ownership)
recipesRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const recipeId = req.params.id;

    // Check ownership
    const { rows: ownershipRows } = await pgPool.query(
      'SELECT user_id FROM recipes WHERE id = $1',
      [recipeId]
    );

    if (ownershipRows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (ownershipRows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own recipes' });
    }

    await pgPool.query('DELETE FROM recipes WHERE id = $1', [recipeId]);

    // Invalidate caches
    await recipeCache.delete(recipeId);

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate recipe (requires auth)
recipesRouter.post('/:id/rate', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const recipeId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if recipe exists
    const { rows: recipeRows } = await pgPool.query(
      'SELECT id FROM recipes WHERE id = $1 AND is_approved = true',
      [recipeId]
    );

    if (recipeRows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Upsert rating
    await pgPool.query(`
      INSERT INTO recipe_ratings (recipe_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (recipe_id, user_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
    `, [recipeId, userId, rating]);

    // Invalidate recipe cache
    await recipeCache.delete(recipeId);

    res.json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular recipes with caching (1 hour cache)
recipesRouter.get('/popular/trending', cacheMiddleware(3600), async (req, res) => {
  try {
    const timeframe = typeof req.query.timeframe === 'string' ? req.query.timeframe : 'week';
    const limit = typeof req.query.limit === 'string' ? Math.min(Number(req.query.limit), 50) : 20;

    // Try cache first
    const cached = await cacheManager.getPopularRecipes(timeframe);
    if (cached) {
      return res.json({ data: cached.slice(0, limit) });
    }

    let dateFilter = '';
    switch (timeframe) {
      case 'day':
        dateFilter = "AND r.created_at > NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND r.created_at > NOW() - INTERVAL '1 week'";
        break;
      case 'month':
        dateFilter = "AND r.created_at > NOW() - INTERVAL '1 month'";
        break;
      default:
        dateFilter = '';
    }

    const { rows } = await pgPool.query(`
      SELECT 
        r.*,
        u.name as author_name,
        COALESCE(AVG(rr.rating), 0) as average_rating,
        COUNT(DISTINCT rr.id) as rating_count,
        COUNT(DISTINCT f.id) as favorite_count,
        COALESCE(r.view_count, 0) as view_count
      FROM recipes r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      WHERE r.is_approved = true ${dateFilter}
      GROUP BY r.id, u.name
      ORDER BY 
        (COUNT(DISTINCT f.id) * 2 + 
         COALESCE(AVG(rr.rating), 0) * COUNT(DISTINCT rr.id) + 
         COALESCE(r.view_count, 0) * 0.1) DESC,
        r.created_at DESC
      LIMIT $1
    `, [limit]);

    // Cache the results
    await cacheManager.setPopularRecipes(timeframe, rows);

    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search suggestions endpoint
recipesRouter.get('/search/suggestions', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    
    if (query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Try cache first
    const cacheKey = `suggestions:${Buffer.from(query).toString('base64')}`;
    const cached = await cacheManager.cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const suggestions = [];

    // Recipe title suggestions
    const { rows: recipeRows } = await pgPool.query(`
      SELECT title, id, 'recipe' as type
      FROM recipes 
      WHERE is_approved = true AND title ILIKE $1
      ORDER BY view_count DESC NULLS LAST
      LIMIT 5
    `, [`%${query}%`]);

    suggestions.push(...recipeRows);

    // Ingredient suggestions
    const { rows: ingredientRows } = await pgPool.query(`
      SELECT DISTINCT ingredient, 'ingredient' as type
      FROM (
        SELECT jsonb_array_elements_text(ingredients) as ingredient
        FROM recipes
        WHERE is_approved = true
      ) t
      WHERE ingredient ILIKE $1
      LIMIT 5
    `, [`%${query}%`]);

    suggestions.push(...ingredientRows.map((row: any) => ({
      title: row.ingredient,
      type: 'ingredient'
    })));

    // Category suggestions
    const { rows: categoryRows } = await pgPool.query(`
      SELECT DISTINCT category as title, 'category' as type
      FROM recipes
      WHERE is_approved = true AND category ILIKE $1
      LIMIT 3
    `, [`%${query}%`]);

    suggestions.push(...categoryRows);

    const result = { suggestions };

    // Cache for 10 minutes
    await cacheManager.cacheSet(cacheKey, result, 600);

    res.json(result);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
recipesRouter.get('/health/cache', async (req, res) => {
  try {
    const health = await cacheManager.healthCheck();
    const info = await cacheManager.getInfo();
    
    res.json({
      cache: health,
      info,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

export default recipesRouter;