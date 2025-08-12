import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth);

// Accepts { dataUrl: "data:image/png;base64,..." } and saves to /app/uploads/images, returns { path: "/images/xxx.png" }
uploadsRouter.post('/image-base64', async (req, res) => {
  const body = req.body as { dataUrl?: string };
  const dataUrl = body?.dataUrl || '';
  const match = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    return res.status(400).json({ error: 'dataUrl must be a base64 image (png/jpeg/webp)' });
  }
  const mime = match[1];
  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
  const base64 = match[3];
  const buffer = Buffer.from(base64, 'base64');
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadDir = '/app/uploads/images';
  const filePath = path.join(uploadDir, filename);
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);
    return res.json({ path: `/images/${filename}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save image' });
  }
});