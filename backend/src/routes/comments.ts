import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listRecipeComments, addRecipeComment, deleteRecipeComment } from '../services/commentsService.js';
import { pgPool } from '../db/pool.js';

export const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', async (req, res) => {
  const recipeId = String(((req as any).params?.id) || '');
  const comments = await listRecipeComments(recipeId);
  res.json({ comments });
});

commentsRouter.post('/', requireAuth, async (req, res) => {
  const recipeId = String(((req as any).params?.id) || '');
  const user = (req as any).user as { id: string };
  const body = req.body as { content?: string } | undefined;
  const content = typeof body?.content === 'string' ? body!.content.trim() : '';
  if (content.length < 1) return res.status(400).json({ error: 'content required' });
  const id = await addRecipeComment(user.id, recipeId, content);
  res.status(201).json({ id });
});

commentsRouter.delete('/:commentId', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: string };
  const commentId = String(req.params.commentId || '');
  const { rows } = await pgPool.query('SELECT is_admin FROM users WHERE id=$1', [user.id]);
  const isAdmin = rows[0]?.is_admin === true;
  const ok = await deleteRecipeComment(user.id, commentId, isAdmin);
  return ok ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});