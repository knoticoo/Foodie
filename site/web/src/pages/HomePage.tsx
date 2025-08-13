import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdsBanner } from '../components/AdsBanner';
import { RatingStars } from '../components/RatingStars';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type RecipeCard = { id: string; title: string; description?: string; cover_image?: string | null; avg_rating?: number | null };

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<RecipeCard[]>([]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams({ limit: '6', offset: '0' });
      const res = await fetch(`${API_BASE_URL}/api/recipes?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setFeatured(Array.isArray(data?.recipes) ? data.recipes : []);
    };
    load().catch(() => setFeatured([]));
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 border p-6">
        <h1 className="text-3xl font-bold mb-2">Discover Latvian recipes</h1>
        <p className="text-gray-700 mb-4">Cook seasonal favorites, save what you love, and plan your week.</p>
        <div className="flex gap-3">
          <Link to="/recipes" className="px-4 py-2 rounded bg-gray-900 text-white">Browse recipes</Link>
          <Link to="/profile" className="px-4 py-2 rounded border">Your profile</Link>
        </div>
      </section>

      <AdsBanner placement="home_top" />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending now</h2>
          <Link to="/recipes" className="text-sm text-blue-600 underline">See all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(r => (
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
                <RatingStars value={r.avg_rating ?? null} />
                {r.description && <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>}
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <div className="text-gray-600">No featured recipes yet.</div>
          )}
        </div>
      </section>
    </div>
  );
};