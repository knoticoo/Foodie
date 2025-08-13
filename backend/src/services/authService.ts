import { pgPool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export async function registerUser(email: string, password: string, name?: string) {
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const { rows } = await pgPool.query(
    'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email',
    [email, passwordHash, name || null]
  );
  const user = rows[0];
  return createToken(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const { rows } = await pgPool.query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
  const user = rows[0];
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  return createToken(user.id, user.email);
}

function createToken(id: string, email: string) {
  return jwt.sign({ sub: id, email }, env.jwtSecret, { expiresIn: '7d' });
}