import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { i18nMiddleware } from './middleware/i18n.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { billingWebhookHandler } from './routes/billing.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { requestLogger } from './middleware/requestLogger.js';
import { pgPool } from './db/pool.js';

const app = express();

// Startup info
console.log(`[boot] API starting with host=${env.host} port=${env.port}`);
console.log(`[boot] DB target host=${env.db.host} port=${env.db.port} db=${env.db.database} user=${env.db.user}`);

// Basic global rate limit: 100 req/min per IP
app.use(createRateLimiter(100, 100));

// Request logging
app.use(requestLogger);

// Hardened CORS: allow only configured origins (comma-separated). '*' allows all.
const allowedOrigins = (env.corsOrigin || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser (curl)
    if (env.corsOrigin === '*' || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Admin-Api-Key'],
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Stripe webhook requires raw body for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhookHandler);

app.use(express.json({ limit: '25mb' }));

// Gracefully handle large JSON bodies (e.g., base64 images)
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  return next(err);
});

// Attach locale info for downstream handlers
app.use(i18nMiddleware);

app.use('/api', apiRouter);

// Friendly 404 for unknown routes
app.use((_, res) => res.status(404).json({ error: 'Not Found' }));

app.use(errorHandler);

app.listen(env.port, env.host, async () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
  // Try an early DB ping with timeout to surface errors in logs
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    // Use a simple query and attach a timeout via connection parameter
    // pg does not support AbortController here; rely on statement_timeout
    await pgPool.query('SET statement_timeout TO 1500');
    const res = await pgPool.query('select 1 as ok');
    clearTimeout(timeout);
    if (res?.rows?.[0]?.ok) {
      console.log('[boot] DB ping ok');
    } else {
      console.warn('[boot] DB ping returned unexpected result');
    }
  } catch (err) {
    console.warn('[boot] DB ping failed:', (err as Error).message);
  }
});