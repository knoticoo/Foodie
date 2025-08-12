import { Pool } from 'pg';
import { env } from '../config/env.js';

export const pgPool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  max: 10,
  idleTimeoutMillis: 30000
});

export async function assertDatabaseConnectionOk(): Promise<void> {
  const result = await pgPool.query('select 1 as ok');
  if (!result?.rows?.[0]?.ok) {
    throw new Error('Database connection failed');
  }
}