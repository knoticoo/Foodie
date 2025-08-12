import type { Request, Response, NextFunction } from 'express';

export type SupportedLocale = 'en' | 'lv' | 'ru';

function pickLocale(header: string | undefined): SupportedLocale {
  const fallback: SupportedLocale = 'en';
  if (!header) return fallback;
  const lc = header.toLowerCase();
  if (lc.includes('lv')) return 'lv';
  if (lc.includes('ru')) return 'ru';
  return 'en';
}

export function i18nMiddleware(req: Request, _res: Response, next: NextFunction) {
  const fromHeader = pickLocale(req.headers['x-lang'] as string | undefined || req.headers['accept-language'] as string | undefined);
  (req as any).locale = fromHeader;
  next();
}