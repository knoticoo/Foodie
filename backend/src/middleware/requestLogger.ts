import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTimeMs = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const durationMs = Date.now() - startTimeMs;
    const { statusCode } = res;
    // Avoid logging very noisy health checks unless slow or non-200
    const isHealth = url.startsWith('/api/health');
    if (!isHealth || statusCode !== 200 || durationMs > 1000) {
      console.log(`[req] ${method} ${url} -> ${statusCode} ${durationMs}ms`);
    }
  });

  next();
}