export const env = {
  port: Number(process.env.API_PORT ?? 3000),
  host: String(process.env.API_HOST ?? '0.0.0.0'),
  corsOrigin: String(process.env.CORS_ORIGIN ?? '*'),
  jwtSecret: String(process.env.JWT_SECRET || ''),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 10),
  adminApiKey: String(process.env.ADMIN_API_KEY || ''),
  db: {
    host: String(process.env.DB_HOST ?? process.env.POSTGRES_HOST ?? 'db'),
    port: Number(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? 5432),
    user: String(process.env.POSTGRES_USER ?? 'recipes'),
    password: String(process.env.POSTGRES_PASSWORD ?? 'recipes_password_change_me'),
    database: String(process.env.POSTGRES_DB ?? 'recipes')
  },
  stripe: {
    secretKey: String(process.env.STRIPE_SECRET_KEY || ''),
    priceId: String(process.env.STRIPE_PRICE_ID || ''),
    webhookSecret: String(process.env.STRIPE_WEBHOOK_SECRET || '')
  }
};

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}