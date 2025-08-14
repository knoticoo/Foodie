import { Router } from 'express';
import { pgPool } from '../db/pool.js';

export const statsRouter = Router();

statsRouter.get('/', async (_req, res) => {
	try {
		const [{ rows: usersRows }, { rows: recipesRows }, { rows: chefsRows }, { rows: favRows }, { rows: ratingRows }] = await Promise.all([
			pgPool.query('SELECT COUNT(*)::int AS total_users FROM users'),
			pgPool.query('SELECT COUNT(*)::int AS total_recipes FROM recipes'),
			pgPool.query("SELECT COUNT(DISTINCT author_user_id)::int AS total_chefs FROM recipes WHERE author_user_id IS NOT NULL"),
			pgPool.query('SELECT COUNT(*)::int AS total_favorites FROM favorites'),
			pgPool.query('SELECT ROUND(AVG(rating)::numeric, 1) AS average_rating FROM recipe_ratings')
		]);

		const payload = {
			total_users: usersRows?.[0]?.total_users ?? 0,
			total_recipes: recipesRows?.[0]?.total_recipes ?? 0,
			total_chefs: chefsRows?.[0]?.total_chefs ?? 0,
			total_favorites: favRows?.[0]?.total_favorites ?? 0,
			average_rating: Number(ratingRows?.[0]?.average_rating ?? 0)
		};
		return res.json(payload);
	} catch (e) {
		return res.status(500).json({ error: 'Failed to load stats' });
	}
});