import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Recipe = { id: string; title: string; description?: string };

export const RecipesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [q, setQ] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [diet, setDiet] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const runSearch = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ingredient) params.set('ingredient', ingredient);
    if (diet) params.set('diet', diet);
    if (maxTime) params.set('maxTime', maxTime);
    if (maxCost) params.set('maxCost', maxCost);
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    const url = `${API_BASE_URL}/api/recipes?${params.toString()}`;
    const res = await (token ? authorizedFetch(url) : fetch(url));
    const data = await res.json().catch(() => ({}));
    setRecipes(Array.isArray(data?.recipes) ? data.recipes : []);
  };

  useEffect(() => {
    runSearch().catch(() => setRecipes([]));
  }, [offset, limit]);

  const resetAndSearch = () => { setOffset(0); runSearch(); };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Browse recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Search text" value={q} onChange={e => setQ(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Ingredient (pantry)" value={ingredient} onChange={e => setIngredient(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Diet (comma-separated)" value={diet} onChange={e => setDiet(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Max time (min)" value={maxTime} onChange={e => setMaxTime(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Max cost (cents)" value={maxCost} onChange={e => setMaxCost(e.target.value)} />
        <button onClick={resetAndSearch} className="px-3 py-2 rounded bg-gray-900 text-white">Search</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map(r => (
          <Link key={r.id} to={`/recipes/${r.id}`} className="block p-4 bg-white rounded border hover:shadow">
            <div className="font-medium">{r.title}</div>
            {r.description && <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>}
          </Link>
        ))}
        {recipes.length === 0 && (
          <div className="text-gray-600">No recipes found.</div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(o - limit, 0))} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
        <button onClick={() => setOffset(o => o + limit)} className="px-3 py-1 rounded bg-gray-200">Next</button>
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};