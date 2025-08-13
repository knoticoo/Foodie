import type { Request, Response } from 'express';
import { z } from 'zod';
import { loginUser, registerUser } from '../services/authService.js';

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  try {
    const token = await registerUser(parsed.data.email, parsed.data.password, parsed.data.name);
    res.json({ token });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    return res.status(400).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  try {
    const token = await loginUser(parsed.data.email, parsed.data.password);
    res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}