import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'recipes',
  password: process.env.POSTGRES_PASSWORD || 'recipes_password_change_me',
  database: process.env.POSTGRES_DB || 'recipes',
  max: 5
});

export async function withClient<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}