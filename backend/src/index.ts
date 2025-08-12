import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { i18nMiddleware } from './middleware/i18n.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { billingWebhookHandler } from './routes/billing.js';
import { createRateLimiter } from './middleware/rateLimit.js';

const app = express();

// Basic global rate limit: 100 req/min per IP
app.use(createRateLimiter(100, 100));

// Hardened CORS: allow only configured origins (comma-separated). '*' allows all.
const allowedOrigins = (env.corsOrigin || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser (curl)
      if (env.corsOrigin === '*' || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false
  })
);

// Stripe webhook requires raw body for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhookHandler);

app.use(express.json({ limit: '1mb' }));

// Attach locale info for downstream handlers
app.use(i18nMiddleware);

app.use('/api', apiRouter);

// Friendly 404 for unknown routes
app.use((_, res) => res.status(404).json({ error: 'Not Found' }));

app.use(errorHandler);

app.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
});