import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdsBanner } from '../components/AdsBanner';
import { RatingStars } from '../components/RatingStars';
import { Modal } from '../components/Modal';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type RecipeCard = { id: string; title: string; description?: string; cover_image?: string | null; avg_rating?: number | null; created_at?: string; is_premium_only?: boolean };

export const HomePage: React.FC = () => {
  const [trending, setTrending] = useState<RecipeCard[]>([]);
  const [newThisWeek, setNewThisWeek] = useState<RecipeCard[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const trendingParams = new URLSearchParams({ limit: '6', offset: '0', sortBy: 'top' });
      const newestParams = new URLSearchParams({ limit: '6', offset: '0', sortBy: 'new' });
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recipes?${trendingParams.toString()}`),
        fetch(`${API_BASE_URL}/api/recipes?${newestParams.toString()}`)
      ]);
      const [d1, d2] = await Promise.all([r1.json().catch(() => ({})), r2.json().catch(() => ({}))]);
      setTrending(Array.isArray(d1?.recipes) ? d1.recipes : []);
      const fresh = (Array.isArray(d2?.recipes) ? d2.recipes : []) as RecipeCard[];
      setNewThisWeek(fresh);
      if (fresh.length > 0) setShowNewModal(true);
    };
    load().catch(() => { setTrending([]); setNewThisWeek([]); });
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 border p-6">
        <h1 className="text-3xl font-bold mb-2">Discover Latvian recipes</h1>
        <p className="text-gray-700 mb-4">Cook seasonal favorites, save what you love, and plan your week.</p>
        <div className="flex gap-3">
          <Link to="/recipes" className="btn btn-primary">Browse recipes</Link>
          <Link to="/profile" className="btn btn-secondary">Your profile</Link>
        </div>
      </section>

      <AdsBanner placement="home_top" />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trending now</h2>
          <Link to="/recipes" className="text-sm text-blue-600 underline">See all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map(r => (
            <Link key={r.id} to={`/recipes/${r.id}`} className="group block rounded overflow-hidden border bg-white hover:shadow transition-shadow">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {r.cover_image ? (
                  <img src={r.cover_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="p-3 space-y-1">
                <div className="font-medium line-clamp-1 flex items-center gap-2">
                  <span>{r.title}</span>
                  {r.is_premium_only && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border">Premium</span>}
                </div>
                <RatingStars value={r.avg_rating ?? null} />
                {r.description && <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>}
              </div>
            </Link>
          ))}
          {trending.length === 0 && (
            <div className="text-gray-600">No featured recipes yet.</div>
          )}
        </div>
      </section>

      <Modal isOpen={showNewModal} title="New this week" onClose={() => setShowNewModal(false)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {newThisWeek.map(r => (
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
                <div className="text-xs text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</div>
              </div>
            </Link>
          ))}
          {newThisWeek.length === 0 && <div className="text-gray-600">No new recipes this week.</div>}
        </div>
      </Modal>
    </div>
  );
};