import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const ipToBucket = new Map<string, Bucket>();

/**
 * Basic token-bucket rate limiter per IP.
 * - capacity: max tokens in bucket
 * - refillPerMinute: tokens added per minute
 */
export function createRateLimiter(capacity = 100, refillPerMinute = 100) {
  const refillPerMs = refillPerMinute / 60000; // tokens per ms

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown').trim();
    const now = Date.now();
    const bucket = ipToBucket.get(ip) || { tokens: capacity, lastRefillMs: now };

    // Refill tokens
    const elapsed = now - bucket.lastRefillMs;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerMs);
    bucket.lastRefillMs = now;

    if (bucket.tokens < 1) {
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    bucket.tokens -= 1;
    ipToBucket.set(ip, bucket);
    next();
  };
}