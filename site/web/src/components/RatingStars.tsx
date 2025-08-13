import React from 'react';

type RatingStarsProps = {
  value: number | null | undefined;
  count?: number | null;
  className?: string;
};

export const RatingStars: React.FC<RatingStarsProps> = ({ value, count, className }) => {
  const v = typeof value === 'number' ? Math.max(0, Math.min(5, value)) : null;
  if (v == null) return <div className={className}>No ratings yet</div>;

  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <div className={`inline-flex items-center gap-1 ${className ?? ''}`} aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className="text-yellow-500">★</span>
      ))}
      {half === 1 && <span className="text-yellow-500 relative">
        <span className="inline-block overflow-hidden" style={{ width: '0.5em' }}>★</span>
        <span className="inline-block text-gray-300 -ml-[0.5em]">★</span>
      </span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-gray-300">★</span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{v.toFixed(1)}{typeof count === 'number' ? ` (${count})` : ''}</span>
    </div>
  );
};