import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pgPool } from '../db/pool.js';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export const profileRouter = Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const user = (req as any).user as { id: string };
    const ext = path.extname(file.originalname);
    cb(null, `profile-${user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

profileRouter.use(requireAuth);

// Get basic profile data (legacy endpoint)
profileRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as { id: string };
  const prefsRes = await pgPool.query('SELECT diet_preferences AS dietPreferences, budget_cents AS budgetCents FROM user_preferences WHERE user_id=$1', [user.id]);
  const favsRes = await pgPool.query('SELECT recipe_id FROM favorites WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [user.id]);
  res.json({
    userId: user.id,
    preferences: prefsRes.rows[0] || { dietPreferences: [], budgetCents: null },
    favorites: favsRes.rows.map((r: any) => r.recipe_id)
  });
});

// Update user profile
profileRouter.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    const { name, bio, location, phone, website } = req.body;
    
    const result = await pgPool.query(
      `UPDATE users 
       SET name = COALESCE($2, name),
           bio = $3,
           location = $4,
           phone = $5,
           website = $6,
           updated_at = NOW()
       WHERE id = $1 
       RETURNING name, bio, location, phone, website`,
      [user.id, name, bio, location, phone, website]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload profile picture
profileRouter.post('/profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const user = (req as any).user as { id: string };
    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update user's profile picture URL in database
    await pgPool.query(
      'UPDATE users SET profile_picture_url = $2 WHERE id = $1',
      [user.id, fileUrl]
    );
    
    res.json({ 
      url: fileUrl,
      message: 'Profile picture uploaded successfully' 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Get user stats
profileRouter.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    
    // Get recipe count
    const recipesResult = await pgPool.query(
      'SELECT COUNT(*) as total_recipes FROM recipes WHERE user_id = $1',
      [user.id]
    );
    
    // Get favorites count
    const favoritesResult = await pgPool.query(
      'SELECT COUNT(*) as total_favorites FROM favorites WHERE user_id = $1',
      [user.id]
    );
    
    // Get average rating of user's recipes
    const avgRatingResult = await pgPool.query(
      `SELECT AVG(r.rating)::numeric(3,2) as avg_rating, COUNT(r.id) as total_ratings
       FROM ratings r 
       JOIN recipes rec ON r.recipe_id = rec.id 
       WHERE rec.user_id = $1`,
      [user.id]
    );
    
    // Get user join date
    const userResult = await pgPool.query(
      'SELECT created_at FROM users WHERE id = $1',
      [user.id]
    );
    
    const totalRecipes = parseInt(recipesResult.rows[0].total_recipes);
    let chefLevel = 'Beginner';
    
    if (totalRecipes >= 50) chefLevel = 'Master Chef';
    else if (totalRecipes >= 20) chefLevel = 'Expert Chef';
    else if (totalRecipes >= 10) chefLevel = 'Chef';
    else if (totalRecipes >= 5) chefLevel = 'Cook';
    
    res.json({
      totalRecipes,
      totalFavorites: parseInt(favoritesResult.rows[0].total_favorites),
      avgRating: parseFloat(avgRatingResult.rows[0].avg_rating) || 0,
      totalRatings: parseInt(avgRatingResult.rows[0].total_ratings),
      joinDate: userResult.rows[0].created_at,
      chefLevel
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get user's created recipes
profileRouter.get('/recipes', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const result = await pgPool.query(
      `SELECT r.id, r.title, r.description, r.image_url, r.created_at, r.is_premium,
              AVG(rt.rating)::numeric(3,2) as rating,
              COUNT(rt.id) as rating_count
       FROM recipes r
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       WHERE r.user_id = $1
       GROUP BY r.id, r.title, r.description, r.image_url, r.created_at, r.is_premium
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );
    
    const totalResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM recipes WHERE user_id = $1',
      [user.id]
    );
    
    res.json({
      recipes: result.rows.map((row: any) => ({
        ...row,
        rating: parseFloat(row.rating) || null,
        rating_count: parseInt(row.rating_count)
      })),
      total: parseInt(totalResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(totalResult.rows[0].total) / limit)
    });
  } catch (error) {
    console.error('User recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// Get user's favorite recipes
profileRouter.get('/favorites', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const result = await pgPool.query(
      `SELECT r.id, r.title, r.description, r.image_url, f.created_at, r.is_premium,
              AVG(rt.rating)::numeric(3,2) as rating,
              COUNT(rt.id) as rating_count
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       WHERE f.user_id = $1
       GROUP BY r.id, r.title, r.description, r.image_url, f.created_at, r.is_premium
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );
    
    const totalResult = await pgPool.query(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = $1',
      [user.id]
    );
    
    res.json({
      recipes: result.rows.map((row: any) => ({
        ...row,
        rating: parseFloat(row.rating) || null,
        rating_count: parseInt(row.rating_count)
      })),
      total: parseInt(totalResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(totalResult.rows[0].total) / limit)
    });
  } catch (error) {
    console.error('User favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch user favorites' });
  }
});

// Delete user's recipe
profileRouter.delete('/recipes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    const recipeId = req.params.id;
    
    // Check if recipe belongs to user
    const checkResult = await pgPool.query(
      'SELECT id FROM recipes WHERE id = $1 AND user_id = $2',
      [recipeId, user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found or not owned by user' });
    }
    
    // Delete recipe (cascading deletes will handle related records)
    await pgPool.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Recipe deletion error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Get user activity feed
profileRouter.get('/activity', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get recent recipe submissions and favorites
    const activities = await pgPool.query(
      `(SELECT 'recipe_submitted' as type, r.id as recipe_id, r.title, r.image_url, r.created_at
        FROM recipes r WHERE r.user_id = $1)
       UNION ALL
       (SELECT 'recipe_favorited' as type, r.id as recipe_id, r.title, r.image_url, f.created_at
        FROM favorites f JOIN recipes r ON f.recipe_id = r.id WHERE f.user_id = $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );
    
    res.json({
      activities: activities.rows,
      page,
      limit
    });
  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});