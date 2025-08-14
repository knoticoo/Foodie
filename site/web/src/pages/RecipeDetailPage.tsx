import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { RatingStars } from '../components/RatingStars';
import { AdsBanner } from '../components/AdsBanner';
import { Clock, Users, ChefHat, Play, Pause, SkipForward, ListChecks, ShoppingCart, Plus, Minus } from 'lucide-react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;
const STATIC_BASE_URL = (import.meta as any).env?.VITE_STATIC_BASE_URL ?? (typeof window !== 'undefined' ? `http://${window.location.hostname}:8080` : 'http://127.0.0.1:8080');

function toImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${STATIC_BASE_URL}${src}`;
  return `${STATIC_BASE_URL}/${src}`;
}

type Recipe = { id: string; title: string; description?: string; ingredients?: any[]; servings?: number; is_premium_only?: boolean; sponsor_name?: string; sponsor_url?: string; total_time_minutes?: number };

type Comment = { id: string; user_id: string; content: string; created_at: string };

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams();
  const { token, authorizedFetch, isPremium } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<any>({ average: null, ratings: [] });
  const [newComment, setNewComment] = useState('');
  const [fav, setFav] = useState<boolean | null>(null);
  const [servings, setServings] = useState<number | null>(null);
  const [scaled, setScaled] = useState<any[] | null>(null);
  const [grocery, setGrocery] = useState<any | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Cook mode state
  const [cookMode, setCookMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Load recipe (handle premium gate)
    fetch(`${API_BASE_URL}/api/recipes/${id}`).then(async (r) => {
      if (r.status === 402) { setPremiumRequired(true); setRecipe(null); return; }
      const data = await r.json();
      setRecipe(data); setServings(data?.servings ?? null);
      // If steps have durations, initialize timer to first step duration
      const stepsArr: any[] = Array.isArray(data?.steps) ? data.steps : [];
      const firstDur = Number(stepsArr?.[0]?.duration || 0);
      if (Number.isFinite(firstDur) && firstDur > 0) setTimerSeconds(firstDur * 60); else setTimerSeconds(0);
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
    setCookMode(false); setCurrentStep(0); setCheckedIngredients({}); setTimerRunning(false);
  }, [id, token]);

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => setTimerSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  if (premiumRequired) return <div className="space-y-2"><div>Premium recipe. Please upgrade to view.</div><a className="text-blue-600 underline" href="/billing">Go Premium</a></div>;
  if (!recipe) return <div>Loading…</div>;

  const steps: any[] = Array.isArray((recipe as any).steps) ? (recipe as any).steps : [];

  const postComment = async () => {
    if (!token || !newComment.trim()) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.trim() })
    });
    if (res.ok) {
      setNewComment('');
      const d = await (await fetch(`${API_BASE_URL}/api/recipes/${id}/comments`)).json();
      setComments(Array.isArray(d?.comments) ? d.comments : []);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!token) return;
    if (!window.confirm('Delete this comment?')) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/comments/${commentId}`, { method: 'DELETE' });
    if (res.status === 204) setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const submitRating = async (star: number) => {
    if (!token) return;
    const res = await authorizedFetch(`${API_BASE_URL}/api/recipes/${id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: star, comment: null })
    });
    if (res.status === 204) {
      const d = await (await fetch(`${API_BASE_URL}/api/recipes/${id}/ratings`)).json();
      setRatings(d || { average: null, ratings: [] });
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

  const totalTime = useMemo(() => {
    const explicit = Number((recipe as any)?.total_time_minutes || 0);
    if (explicit > 0) return explicit;
    // otherwise sum durations if present
    const sum = steps.reduce((acc, s) => acc + (Number(s?.duration || 0) || 0), 0);
    return sum || null;
  }, [recipe, steps]);

  const fmtTime = (m?: number | null) => {
    if (!m || m <= 0) return '—';
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm ? `${h} h ${mm} min` : `${h} h`;
  };

  const currentStepObj = steps[currentStep] || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span>{recipe.title}</span>
          {recipe.is_premium_only && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border">Premium</span>}
        </h1>
        {recipe.description && <p className="text-gray-700 text-lg leading-relaxed">{recipe.description}</p>}
        {(recipe.sponsor_name && recipe.sponsor_url) && (
          <a className="text-sm text-blue-600 underline" href={recipe.sponsor_url} target="_blank" rel="noreferrer">Sponsored by {recipe.sponsor_name}</a>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {fmtTime(totalTime)}</span>
          <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {servings ?? recipe.servings ?? 2} porcijas</span>
        </div>
      </div>

      <AdsBanner placement="recipe_detail_inline" />

      {/* Hero Image */}
      {Array.isArray((recipe as any).images) && (recipe as any).images.length > 0 && (
        <div className="space-y-2">
          <div className="aspect-[16/9] bg-gray-100 overflow-hidden rounded-xl shadow">
            <img
              src={toImageUrl((recipe as any).images[0])}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onClick={() => setLightboxIdx(0)}
            />
          </div>
          {(recipe as any).images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {(recipe as any).images.slice(1, 5).map((src: string, i: number) => (
                <button key={i} className="aspect-square rounded overflow-hidden bg-gray-100" onClick={() => setLightboxIdx(i + 1)}>
                  <img src={toImageUrl(src)} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 border rounded-lg px-2 py-1">
          <button className="p-1" aria-label="Minus" onClick={() => setServings(s => Math.max(1, Number(s || recipe.servings || 2) - 1))}><Minus className="w-4 h-4" /></button>
          <span className="min-w-[3rem] text-center">{servings ?? recipe.servings ?? 2}</span>
          <button className="p-1" aria-label="Plus" onClick={() => setServings(s => Number(s || recipe.servings || 2) + 1)}><Plus className="w-4 h-4" /></button>
          <button className="ml-2 btn btn-secondary" onClick={loadScaled}>Mērogot</button>
        </div>
        <button onClick={loadGrocery} className="btn btn-secondary inline-flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Saraksts</button>
        {token && <button onClick={toggleFavorite} className="btn btn-secondary">{fav ? 'Atcelt izlasi' : 'Saglabāt izlasi'}</button>}
        <button className="btn btn-primary inline-flex items-center gap-2" onClick={() => setCookMode(v => !v)}>
          {cookMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {cookMode ? 'Stop' : 'Cook Mode'}
        </button>
      </div>

      {/* Ingredients and Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><ListChecks className="w-4 h-4" /> Sastāvdaļas</h2>
              <ul className="space-y-2 text-sm text-gray-800">
                {recipe.ingredients.map((it: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" checked={!!checkedIngredients[idx]} onChange={() => setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }))} />
                    <span>{it.name ?? it.ingredient ?? 'Item'} — {it.quantity ?? it.amount ?? ''} {it.unit ?? ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scaled && (
            <div className="bg-white border rounded-xl p-4 shadow-sm mt-4">
              <h3 className="font-medium mb-2">Mērogotas sastāvdaļas</h3>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {scaled.map((it: any, idx: number) => (
                  <li key={idx}>{it.name} — {it.quantity} {it.unit}</li>
                ))}
              </ul>
            </div>
          )}

          {grocery && (
            <div className="bg-white border rounded-xl p-4 shadow-sm mt-4">
              <h3 className="font-medium mb-2">Iepirkumu saraksts</h3>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {(grocery.items || []).map((it: any, idx: number) => (
                  <li key={idx}>{it.name} — {it.totalQuantity} {it.unit}</li>
                ))}
              </ul>
              {grocery.pricing ? (
                <div className="text-sm text-gray-700 mt-2">
                  Aptuvenās izmaksas: €{((grocery.pricing.totalCents || 0) / 100).toFixed(2)}
                  {grocery.pricing.totalCents === 0 && (
                    <div className="text-xs text-amber-600 mt-1">
                      * Daži produkti nav atrodami cenrāžos
                    </div>
                  )}
                </div>
              ) : grocery.premiumNote ? (
                <div className="text-sm text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                  💎 Premium nepieciešams izmaksu aprēķinam un detalizētai cenu analīzei
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {steps.length > 0 && (
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><ChefHat className="w-4 h-4" /> Gatavošana</h2>
              {!cookMode ? (
                <ol className="list-decimal ml-6 space-y-3 text-gray-800">
                  {steps.map((s: any, i: number) => (
                    <li key={i} className="leading-relaxed">
                      <div className="flex justify-between items-start gap-2">
                        <span>{typeof s === 'string' ? s : (s?.text ?? '')}</span>
                        {s?.duration && <span className="text-xs text-gray-500 whitespace-nowrap"><Clock className="inline w-3 h-3 mr-1" />{s.duration} min</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Solis {currentStep + 1} no {steps.length}</div>
                  <div className="text-lg leading-relaxed">{typeof currentStepObj === 'string' ? currentStepObj : (currentStepObj?.text ?? '')}</div>
                  <div className="flex items-center gap-3">
                    <button className="btn btn-secondary" onClick={() => setTimerRunning(r => !r)}>{timerRunning ? 'Pauze' : 'Starts'}</button>
                    <div className="font-mono text-lg">{String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}</div>
                    <button className="btn btn-secondary inline-flex items-center gap-2" onClick={() => {
                      const next = Math.min(steps.length - 1, currentStep + 1);
                      setCurrentStep(next);
                      const dur = Number(steps[next]?.duration || 0);
                      setTimerSeconds(Number.isFinite(dur) && dur > 0 ? dur * 60 : 0);
                    }}><SkipForward className="w-4 h-4" /> Nākamais solis</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ratings and Comments */}
          <div className="bg-white border rounded-xl p-4 shadow-sm mt-4">
            <h2 className="font-semibold mb-2">Novērtējums</h2>
            <div className="flex items-center gap-3">
              <RatingStars value={ratings.average} />
              <div className="text-sm text-gray-600">Vidējais: {ratings.average ?? '—'}</div>
              {token ? (
                <div className="inline-flex items-center gap-1 ml-auto" aria-label="Set rating">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      className={`text-2xl hover:scale-110 transition-transform ${Math.round(Number(ratings.average || 0)) >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      onClick={() => submitRating(star)}
                      aria-label={`Rate ${star}`}
                      title={`Rate ${star}`}
                    >★</button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600 ml-auto">Ieiet, lai vērtētu.</div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm mt-4">
            <h2 className="font-semibold mb-2">Komentāri</h2>
            {token && (
              <div className="mb-3">
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Uzrakstiet komentāru"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); postComment(); } }}
                />
                <div className="flex justify-end mt-2">
                  <button onClick={postComment} className="btn btn-primary">Publicēt</button>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {comments.map(c => (
                <li key={c.id} className="bg-white border rounded p-3">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(c.created_at).toLocaleString()}</div>
                  {token && <button onClick={() => deleteComment(c.id)} className="text-xs text-red-600 mt-1">Dzēst</button>}
                </li>
              ))}
              {comments.length === 0 && <div className="text-gray-600 text-sm">Pagaidām nav komentāru.</div>}
            </ul>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx != null && Array.isArray((recipe as any).images) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <img src={toImageUrl((recipe as any).images[lightboxIdx])} alt="Full" className="max-w-[90vw] max-h-[85vh] rounded shadow-lg" />
        </div>
      )}
    </div>
  );
};