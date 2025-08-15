import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { RatingStars } from '../components/RatingStars';
import { AdsBanner } from '../components/AdsBanner';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Play, 
  Pause, 
  SkipForward, 
  ListChecks, 
  ShoppingCart, 
  Plus, 
  Minus,
  Heart,
  Share2,
  Download,
  Star,
  Timer,
  CheckCircle,
  AlertCircle,
  Crown,
  X,
  ArrowLeft,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

  if (premiumRequired) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Recepte</h2>
          <p className="text-gray-600 mb-6">Šī recepte ir pieejama tikai Premium lietotājiem. Iegādājieties Premium, lai piekļūtu ekskluzīvām receptēm un papildu funkcijām.</p>
          <motion.a 
            href="/billing" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Crown className="w-5 h-5" />
            Iegādāties Premium
          </motion.a>
        </motion.div>
      </motion.div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Ielādē recepti...</p>
        </div>
      </div>
    );
  }

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
    if (!window.confirm('Dzēst šo komentāru?')) return;
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
    return mm ? `${h} st ${mm} min` : `${h} st`;
  };

  const currentStepObj = steps[currentStep] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={fadeInUp} className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative">
              {/* Hero Image */}
              {Array.isArray((recipe as any).images) && (recipe as any).images.length > 0 && (
                <div className="relative h-96 md:h-[500px] overflow-hidden">
                  <img
                    src={toImageUrl((recipe as any).images[0])}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onClick={() => setLightboxIdx(0)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Action Buttons */}
                  <div className="absolute top-6 right-6 flex gap-3">
                    {token && (
                      <motion.button
                        onClick={toggleFavorite}
                        className={`w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 ${
                          fav ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
                      </motion.button>
                    )}
                    <motion.button
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Recipe Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{recipe.title}</h1>
                        {recipe.is_premium_only && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold">
                            <Crown className="w-4 h-4" />
                            Premium
                          </span>
                        )}
                      </div>
                      
                      {recipe.description && (
                        <p className="text-gray-200 text-lg md:text-xl leading-relaxed mb-6 max-w-3xl">{recipe.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">{fmtTime(totalTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">{servings ?? recipe.servings ?? 2} porcijas</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Star className="w-5 h-5 fill-current text-yellow-400" />
                          <span className="font-medium">{ratings.average ? Number(ratings.average).toFixed(1) : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Images Carousel */}
              {(recipe as any).images && (recipe as any).images.length > 1 && (
                <div className="p-6 bg-gray-50">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {(recipe as any).images.slice(1, 6).map((src: string, i: number) => (
                      <motion.button 
                        key={i} 
                        className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                        onClick={() => setLightboxIdx(i + 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={toImageUrl(src)} alt={`Papildu attēls ${i + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <AdsBanner placement="recipe_detail_inline" />

          {/* Controls */}
          <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Servings Control */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="text-sm font-medium text-gray-700">Porcijas:</span>
                <div className="flex items-center gap-2">
                  <motion.button 
                    className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                    onClick={() => setServings(s => Math.max(1, Number(s || recipe.servings || 2) - 1))}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="w-12 text-center font-semibold">{servings ?? recipe.servings ?? 2}</span>
                  <motion.button 
                    className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                    onClick={() => setServings(s => Number(s || recipe.servings || 2) + 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button 
                  onClick={loadScaled} 
                  className="ml-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Pārrēķināt
                </motion.button>
              </div>

              {/* Action Buttons */}
              <motion.button 
                onClick={loadGrocery} 
                className="flex items-center gap-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-4 h-4" />
                Iepirkumu saraksts
              </motion.button>

              <motion.button 
                className="flex items-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                onClick={() => setCookMode(v => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cookMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {cookMode ? 'Apturēt gatavošanu' : 'Sākt gatavošanu'}
              </motion.button>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients Sidebar */}
            <motion.div variants={fadeInUp} className="lg:col-span-1 space-y-6">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-blue-500" />
                    Sastāvdaļas
                  </h2>
                  <div className="space-y-3">
                    {recipe.ingredients.map((it: any, idx: number) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500" 
                          checked={!!checkedIngredients[idx]} 
                          onChange={() => setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }))} 
                        />
                        <span className={`flex-1 ${checkedIngredients[idx] ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          <span className="font-medium">{it.name ?? it.ingredient ?? 'Produkts'}</span>
                          <span className="text-gray-600 ml-2">— {it.quantity ?? it.amount ?? ''} {it.unit ?? ''}</span>
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {scaled && (
                <motion.div 
                  className="bg-blue-50 rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Pārrēķinātās sastāvdaļas
                  </h3>
                  <div className="space-y-2">
                    {scaled.map((it: any, idx: number) => (
                      <div key={idx} className="text-blue-800">
                        <span className="font-medium">{it.name}</span> — {it.quantity} {it.unit}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {grocery && (
                <motion.div 
                  className="bg-green-50 rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Iepirkumu saraksts
                  </h3>
                  <div className="space-y-2 mb-4">
                    {(grocery.items || []).map((it: any, idx: number) => (
                      <div key={idx} className="text-green-800">
                        <span className="font-medium">{it.name}</span> — {it.totalQuantity} {it.unit}
                      </div>
                    ))}
                  </div>
                  {grocery.pricing ? (
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="text-green-900 font-semibold">
                        Aptuvenās izmaksas: €{((grocery.pricing.totalCents || 0) / 100).toFixed(2)}
                      </div>
                      {grocery.pricing.totalCents === 0 && (
                        <div className="text-xs text-amber-600 mt-1">
                          * Daži produkti nav atrodami cenrāžos
                        </div>
                      )}
                    </div>
                  ) : grocery.premiumNote ? (
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Crown className="w-4 h-4" />
                        <span className="font-medium">Premium nepieciešams izmaksu aprēķinam</span>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </motion.div>

            {/* Steps and Content */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              {steps.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    Gatavošanas soļi
                  </h2>
                  
                  {!cookMode ? (
                    <div className="space-y-6">
                      {steps.map((s: any, i: number) => (
                        <motion.div 
                          key={i} 
                          className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 leading-relaxed">{typeof s === 'string' ? s : (s?.text ?? '')}</p>
                            {s?.duration && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                <Timer className="w-4 h-4" />
                                {s.duration} minūtes
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-orange-700">Solis {currentStep + 1} no {steps.length}</span>
                        <div className="w-32 bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-lg leading-relaxed text-gray-900 mb-6">
                        {typeof currentStepObj === 'string' ? currentStepObj : (currentStepObj?.text ?? '')}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <motion.button 
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          onClick={() => setTimerRunning(r => !r)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {timerRunning ? 'Pauze' : 'Sākt'}
                        </motion.button>
                        
                        <div className="flex items-center gap-2 text-2xl font-mono font-bold text-orange-700">
                          <Timer className="w-5 h-5" />
                          {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <motion.button 
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          onClick={() => {
                            const prev = Math.max(0, currentStep - 1);
                            setCurrentStep(prev);
                            const dur = Number(steps[prev]?.duration || 0);
                            setTimerSeconds(Number.isFinite(dur) && dur > 0 ? dur * 60 : 0);
                          }}
                          disabled={currentStep === 0}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Iepriekšējais
                        </motion.button>
                        
                        <motion.button 
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          onClick={() => {
                            const next = Math.min(steps.length - 1, currentStep + 1);
                            setCurrentStep(next);
                            const dur = Number(steps[next]?.duration || 0);
                            setTimerSeconds(Number.isFinite(dur) && dur > 0 ? dur * 60 : 0);
                          }}
                          disabled={currentStep >= steps.length - 1}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowRight className="w-4 h-4" />
                          Nākamais
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Ratings and Comments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Novērtējums un komentāri</h2>
                
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <RatingStars value={ratings.average} />
                    <div className="text-lg font-semibold text-gray-900">
                      {ratings.average ? Number(ratings.average).toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ({ratings.ratings?.length || 0} vērtējumi)
                    </div>
                  </div>
                  
                  {token ? (
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <motion.button
                          key={star}
                          className={`text-2xl transition-colors ${Math.round(Number(ratings.average || 0)) >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                          onClick={() => submitRating(star)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ★
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Ielogojieties, lai vērtētu</div>
                  )}
                </div>

                {token && (
                  <div className="mb-6">
                    <textarea
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Dalieties ar savu pieredzi par šo recepti..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); postComment(); } }}
                    />
                    <div className="flex justify-end mt-3">
                      <motion.button 
                        onClick={postComment} 
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Publicēt komentāru
                      </motion.button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.map(c => (
                    <motion.div 
                      key={c.id} 
                      className="bg-gray-50 rounded-xl p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-gray-900 whitespace-pre-wrap mb-2">{c.content}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('lv-LV')}</div>
                        {token && (
                          <button 
                            onClick={() => deleteComment(c.id)} 
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                          >
                            Dzēst
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Pagaidām nav komentāru</p>
                      <p className="text-sm">Esiet pirmais, kas dalās ar savu pieredzi!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxIdx != null && Array.isArray((recipe as any).images) && (
          <motion.div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={toImageUrl((recipe as any).images[lightboxIdx])} 
                alt="Pilns attēls" 
                className="max-w-full max-h-full rounded-lg shadow-2xl" 
              />
              <button
                onClick={() => setLightboxIdx(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};