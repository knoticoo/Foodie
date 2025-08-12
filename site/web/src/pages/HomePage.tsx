import React, { useEffect, useState } from 'react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`).then(r => r.text()).then(setHealth).catch(() => setHealth('unreachable'));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Discover recipes</h1>
      <p className="text-gray-600">Browse curated Latvian recipes and save your favorites.</p>
      <div className="rounded border bg-white p-4">
        <div className="text-sm text-gray-500">API health</div>
        <div className="font-mono text-sm mt-1">{health || '...'}</div>
      </div>
    </div>
  );
};