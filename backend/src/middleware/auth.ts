import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    (req as any).user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}