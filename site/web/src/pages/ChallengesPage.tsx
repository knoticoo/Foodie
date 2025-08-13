import React, { useEffect, useState } from 'react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Challenge = { id: string; title: string; description?: string; start_date?: string; end_date?: string };

export const ChallengesPage: React.FC = () => {
  const [items, setItems] = useState<Challenge[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/challenges`).then(r => r.json()).then(d => setItems(d?.challenges || [])).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Challenges</h1>
      <p className="text-sm text-gray-700 mb-4">Join themed cooking challenges, submit your best, and explore winners.</p>
      <ul className="space-y-3">
        {items.map(c => (
          <li key={c.id} className="bg-white border rounded p-3">
            <div className="font-medium">{c.title}</div>
            {c.description && <div className="text-sm text-gray-700">{c.description}</div>}
            <div className="text-xs text-gray-500">{c.start_date} – {c.end_date}</div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <div className="text-gray-600">No challenges found.</div>}
    </div>
  );
};