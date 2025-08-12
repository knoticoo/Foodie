import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';
import { billingWebhookHandler } from './routes/billing.js';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: false }));

// Stripe webhook requires raw body for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhookHandler);

app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
});