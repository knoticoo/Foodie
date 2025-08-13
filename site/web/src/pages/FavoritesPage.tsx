import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Favorite = { recipe_id: string; title?: string };

type FavRow = { id: string; title: string; is_premium_only?: boolean };

export const FavoritesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [items, setItems] = useState<FavRow[]>([]);

  useEffect(() => {
    if (!token) return;
    authorizedFetch(`${API_BASE_URL}/api/favorites`).then(r => r.json()).then(async d => {
      const raw: Favorite[] = d?.favorites ?? [];
      const enriched: FavRow[] = [];
      for (const it of raw) {
        try {
          const r = await fetch(`${API_BASE_URL}/api/recipes/${it.recipe_id}`).then(x => x.json());
          enriched.push({ id: it.recipe_id, title: r?.title || it.title || it.recipe_id, is_premium_only: r?.is_premium_only });
        } catch {
          enriched.push({ id: it.recipe_id, title: it.title || it.recipe_id });
        }
      }
      setItems(enriched);
    }).catch(() => setItems([]));
  }, [token]);

  if (!token) return <div>Please login to view your favorites.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Your favorites</h1>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="bg-white border rounded p-3 flex items-center gap-2">
            <Link to={`/recipes/${it.id}`} className="text-blue-600 underline">{it.title}</Link>
            {it.is_premium_only && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border">Premium</span>}
          </li>
        ))}
        {items.length === 0 && <div className="text-gray-600">No favorites yet.</div>}
      </ul>
    </div>
  );
};