export const env = {
  port: Number(process.env.API_PORT ?? 3000),
  host: String(process.env.API_HOST ?? '0.0.0.0'),
  corsOrigin: String(process.env.CORS_ORIGIN ?? '*'),
  db: {
    host: String(process.env.POSTGRES_HOST ?? 'db'),
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: String(process.env.POSTGRES_USER ?? 'recipes'),
    password: String(process.env.POSTGRES_PASSWORD ?? 'recipes_password_change_me'),
    database: String(process.env.POSTGRES_DB ?? 'recipes')
  }
};