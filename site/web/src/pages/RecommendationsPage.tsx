import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Recipe = { id: string; title: string; description?: string };

export const RecommendationsPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!token) return;
    authorizedFetch(`${API_BASE_URL}/api/recommendations`)
      .then(r => r.json())
      .then(d => setRecipes(Array.isArray(d?.recipes) ? d.recipes : []))
      .catch(() => setRecipes([]));
  }, [token]);

  if (!token) return <div>Please login to see your recommendations.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Recommended for you</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map(r => (
          <Link key={r.id} to={`/recipes/${r.id}`} className="block p-4 bg-white rounded border hover:shadow">
            <div className="font-medium">{r.title}</div>
            {r.description && <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>}
          </Link>
        ))}
        {recipes.length === 0 && (
          <div className="text-gray-600">No recommendations yet.</div>
        )}
      </div>
    </div>
  );
};