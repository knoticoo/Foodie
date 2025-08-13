import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Favorite = { recipe_id: string; title?: string };

export const FavoritesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [items, setItems] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!token) return;
    authorizedFetch(`${API_BASE_URL}/api/favorites`).then(r => r.json()).then(d => setItems(d?.favorites ?? [])).catch(() => setItems([]));
  }, [token]);

  if (!token) return <div>Please login to view your favorites.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Your favorites</h1>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.recipe_id} className="bg-white border rounded p-3">
            <Link to={`/recipes/${it.recipe_id}`} className="text-blue-600 underline">{it.title ?? it.recipe_id}</Link>
          </li>
        ))}
        {items.length === 0 && <div className="text-gray-600">No favorites yet.</div>}
      </ul>
    </div>
  );
};