import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { RatingStars } from '../components/RatingStars';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Recipe = { id: string; title: string; description?: string; ingredients?: any[]; servings?: number; is_premium_only?: boolean; sponsor_name?: string; sponsor_url?: string };

type Comment = { id: string; user_id: string; content: string; created_at: string };

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams();
  const { token, authorizedFetch, isPremium } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<any>({ average: null, ratings: [] });
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newRatingComment, setNewRatingComment] = useState('');
  const [fav, setFav] = useState<boolean | null>(null);
  const [servings, setServings] = useState<number | null>(null);
  const [scaled, setScaled] = useState<any[] | null>(null);
  const [grocery, setGrocery] = useState<any | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    // Load recipe (handle premium gate)
    fetch(`${API_BASE_URL}/api/recipes/${id}`).then(async (r) => {
      if (r.status === 402) { setPremiumRequired(true); setRecipe(null); return; }
      const data = await r.json();
      setRecipe(data); setServings(data?.servings ?? null);
    }).catch(() => setRecipe(null));

    // Comments
    fetch(`${API_BASE_URL}/api/recipes/${id}/comments`).then(r => r.json()).then(d => setComments(Array.isArray(d?.comments) ? d.comments : [])).catch(() => setComments([]));
    // Ratings
    fetch(`${API_BASE_URL}/api/recipes/${id}/ratings`).then(r => r.json()).then(d => setRatings(d || { average: null, ratings: [] })).catch(() => setRatings({ average: null, ratings: [] }));

    // Favorites state
    if (token) {
      authorizedFetch(`${API_BASE_URL}/api/favorites`).then(r => r.json()).then(d => {
        const exists = (Array.isArray(d?.favorites) ? d.favorites : []).some((it: any) => it.id === id || it.recipe_id === id);
        setFav(exists);
      }).catch(() => setFav(null));
    } else setFav(null);

    setScaled(null); setGrocery(null); setPremiumRequired(false);
  }, [id, token]);

  if (premiumRequired) return <div className="space-y-2"><div>Premium recipe. Please upgrade to view.</div><a className="text-blue-600 underline" href="/billing">Go Premium</a></div>;
  if (!recipe) return <div>Loading…</div>;

  const steps: any[] = Array.isArray((recipe as any).steps) ? (recipe as any).steps : [];

  const postComment = async () => {
    if (!token || !newComment.trim()) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    });
    if (res.ok) {
      setNewComment('');
      const d = await (await fetch(`${API_BASE_URL}/api/recipes/${id}/comments`)).json();
      setComments(Array.isArray(d?.comments) ? d.comments : []);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!token) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/comments/${commentId}`, { method: 'DELETE' });
    if (res.status === 204) setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const postRating = async () => {
    if (!token) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating, comment: newRatingComment || null })
    });
    if (res.status === 204) {
      const d = await (await fetch(`${API_BASE_URL}/api/recipes/${id}/ratings`)).json();
      setRatings(d || { average: null, ratings: [] });
      setNewRating(5); setNewRatingComment('');
    }
  };

  const toggleFavorite = async () => {
    if (!token || !id) return;
    if (fav) {
      const res = await authorizedFetch(`${API_BASE_URL}/api/favorites/${id}`, { method: 'DELETE' });
      if (res.status === 204) setFav(false);
    } else {
      const res = await authorizedFetch(`${API_BASE_URL}/api/favorites/${id}`, { method: 'POST' });
      if (res.status === 201 || res.status === 204) setFav(true);
    }
  };

  const loadScaled = async () => {
    if (!id || !servings) return;
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}/scale?servings=${servings}`);
    const data = await res.json();
    setScaled(Array.isArray(data?.ingredients) ? data.ingredients : []);
  };

  const loadGrocery = async () => {
    if (!id) return;
    const res = await (token ? authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/grocery-list`) : fetch(`${API_BASE_URL}/api/recipes/${id}/grocery-list`));
    const data = await res.json().catch(() => ({}));
    if (res.ok) setGrocery(data);
    else if (res.status === 402) setGrocery({ items: data.items, premiumNote: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{recipe.title}</h1>
        {recipe.description && <p className="text-gray-700">{recipe.description}</p>}
        {(recipe.sponsor_name && recipe.sponsor_url) && (
          <a className="text-sm text-blue-600 underline" href={recipe.sponsor_url} target="_blank" rel="noreferrer">Sponsored by {recipe.sponsor_name}</a>
        )}
      </div>

      {/* Image gallery */}
      {Array.isArray((recipe as any).images) && (recipe as any).images.length > 0 && (
        <div className="space-y-2">
          <div className="aspect-[16/9] bg-gray-100 overflow-hidden rounded">
            <img
              src={(recipe as any).images[0]}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onClick={() => setLightboxIdx(0)}
            />
          </div>
          {(recipe as any).images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {(recipe as any).images.slice(1, 5).map((src: string, i: number) => (
                <button key={i} className="aspect-square rounded overflow-hidden bg-gray-100" onClick={() => setLightboxIdx(i + 1)}>
                  <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {token && <button onClick={toggleFavorite} className="px-3 py-1 rounded bg-gray-200">{fav ? 'Remove favorite' : 'Save to favorites'}</button>}
        <RatingStars value={ratings.average} />
      </div>

      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Ingredients</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {recipe.ingredients.map((it: any, idx: number) => (
              <li key={idx}>{it.name ?? it.ingredient ?? 'Item'} — {it.quantity ?? it.amount ?? ''} {it.unit ?? ''}</li>
            ))}
          </ul>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Instructions</h2>
          <ol className="list-decimal ml-6 space-y-2 text-gray-800">
            {steps.map((s: any, i: number) => (
              <li key={i} className="leading-relaxed">{typeof s === 'string' ? s : s?.text ?? ''}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="text-sm">Servings</label>
        <input type="number" min={1} value={servings ?? 2} onChange={e => setServings(Number(e.target.value || 1))} className="border rounded px-2 py-1 w-20" />
        <button onClick={loadScaled} className="px-3 py-1 rounded bg-gray-200">Scale</button>
        <button onClick={loadGrocery} className="px-3 py-1 rounded bg-gray-200">Grocery list</button>
      </div>

      {scaled && (
        <div>
          <h2 className="font-medium mb-2">Scaled ingredients</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {scaled.map((it: any, idx: number) => (
              <li key={idx}>{it.name} — {it.quantity} {it.unit}</li>
            ))}
          </ul>
        </div>
      )}

      {grocery && (
        <div>
          <h2 className="font-medium mb-2">Grocery list</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {(grocery.items || []).map((it: any, idx: number) => (
              <li key={idx}>{it.name} — {it.totalQuantity} {it.unit}</li>
            ))}
          </ul>
          {grocery.pricing ? (
            <div className="text-sm text-gray-700 mt-2">Estimated total: €{((grocery.pricing.totalCents || 0) / 100).toFixed(2)}</div>
          ) : grocery.premiumNote ? (
            <div className="text-sm text-gray-600 mt-2">Premium required for cost estimation.</div>
          ) : null}
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Ratings</h2>
        <div className="text-sm text-gray-600 mb-2">Average: {ratings.average ?? '—'}</div>
        {token && (
          <div className="flex items-center gap-2 mb-3">
            <label className="sr-only">Rate</label>
            <div className="inline-flex">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  className={`text-2xl ${newRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => setNewRating(star)}
                  aria-label={`Rate ${star}`}
                >★</button>
              ))}
            </div>
            <input className="border rounded px-2 py-1 flex-1" placeholder="Comment (optional)" value={newRatingComment} onChange={e => setNewRatingComment(e.target.value)} />
            <button onClick={postRating} className="px-3 py-1 rounded bg-gray-900 text-white">Submit</button>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-medium mb-2">Comments</h2>
        {token && (
          <div className="flex items-center gap-2 mb-3">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Write a comment" value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button onClick={postComment} className="px-3 py-1 rounded bg-gray-900 text-white">Post</button>
          </div>
        )}
        <ul className="space-y-2">
          {comments.map(c => (
            <li key={c.id} className="bg-white border rounded p-2">
              <div className="text-sm">{c.content}</div>
              <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
              {token && <button onClick={() => deleteComment(c.id)} className="text-xs text-red-600 mt-1">Delete</button>}
            </li>
          ))}
          {comments.length === 0 && <div className="text-gray-600 text-sm">No comments yet.</div>}
        </ul>
      </div>

      {/* Lightbox */}
      {lightboxIdx != null && Array.isArray((recipe as any).images) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fadeIn" onClick={() => setLightboxIdx(null)}>
          <img src={(recipe as any).images[lightboxIdx]} alt="Full" className="max-w-[90vw] max-h-[85vh] rounded shadow-lg animate-scaleIn" />
        </div>
      )}
    </div>
  );
};