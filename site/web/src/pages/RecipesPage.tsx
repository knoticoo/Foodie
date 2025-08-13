import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Recipe = { id: string; title: string; description?: string; cover_image?: string | null; avg_rating?: number | null };

export const RecipesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [category, setCategory] = useState<string>('');

  const runSearch = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    // category is UI-only for now; backend has no category filter yet
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Browse recipes</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} />
        <select className="border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
        </select>
        <button onClick={resetAndSearch} className="px-3 py-2 rounded bg-gray-900 text-white">Search</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(r => (
          <Link key={r.id} to={`/recipes/${r.id}`} className="group block rounded overflow-hidden border bg-white hover:shadow transition-shadow">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              {r.cover_image ? (
                <img src={r.cover_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
              )}
            </div>
            <div className="p-3 space-y-1">
              <div className="font-medium line-clamp-1">{r.title}</div>
              {r.avg_rating != null && (
                <div className="text-sm text-yellow-600">{'★'.repeat(Math.round(Number(r.avg_rating)))}{'☆'.repeat(5 - Math.round(Number(r.avg_rating)))} <span className="text-gray-600 ml-1">{Number(r.avg_rating).toFixed(1)}</span></div>
              )}
              {r.description && <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>}
            </div>
          </Link>
        ))}
        {recipes.length === 0 && (
          <div className="text-gray-600">No recipes found.</div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
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