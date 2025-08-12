import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
});