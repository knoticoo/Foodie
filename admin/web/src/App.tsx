import React, { useEffect, useState } from 'react';
import { t, setLang, getLang } from './i18n';

const API = (import.meta as any).env?.VITE_API_BASE_URL || window.__VITE__?.VITE_API_BASE_URL || '';
const STATIC_BASE = (import.meta as any).env?.VITE_STATIC_BASE_URL || window.__VITE__?.VITE_STATIC_BASE_URL || '';
const ADMIN_API_KEY = (import.meta as any).env?.VITE_ADMIN_API_KEY || window.__VITE__?.VITE_ADMIN_API_KEY || '';
// Add public site base URL (fallback: replace :5173 with :80)
const PUBLIC_WEB_BASE = (import.meta as any).env?.VITE_PUBLIC_WEB_BASE_URL || (window as any).__VITE__?.VITE_PUBLIC_WEB_BASE_URL || window.location.origin.replace(':5173', ':80');

function toImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${STATIC_BASE}${src}`;
  return `${STATIC_BASE}/${src}`;
}

export function App() {
  const [health, setHealth] = useState<{ status?: string; db?: string; durationMs?: number } | null>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total_users?: number; total_recipes?: number; total_comments?: number; total_ratings?: number } | null>(null);
  const [latestComments, setLatestComments] = useState<any[]>([]);
  const [recipeComments, setRecipeComments] = useState<any[]>([]);

  // JWT auth fallback (if no ADMIN_API_KEY)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string>(() => localStorage.getItem('admin_jwt') || '');
  // Track logged-in admin email (for header)
  const [adminEmail, setAdminEmail] = useState<string>('');

  // Planner state
  const [weekStart, setWeekStart] = useState(''); // YYYY-MM-DD
  const [plan, setPlan] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState('');

  // Preferences state
  const [dietPreferences, setDietPreferences] = useState<string>(''); // comma-separated
  const [budgetCents, setBudgetCents] = useState<string>('');
  const [prefsStatus, setPrefsStatus] = useState('');

  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratings, setRatings] = useState<any[]>([]);

  const [challenges, setChallenges] = useState<any[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', start: '', end: '' });

  const [premiumUserId, setPremiumUserId] = useState('');
  const [premiumUntil, setPremiumUntil] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [compareName, setCompareName] = useState('');
  const [compareUnit, setCompareUnit] = useState('g');
  const [compareResult, setCompareResult] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [adPlacement, setAdPlacement] = useState('home_top');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [storeId, setStoreId] = useState('1');
  const [affiliateTemplate, setAffiliateTemplate] = useState('https://example.com/search?q={query}&aff=YOURID');

  // Users section state
  const [users, setUsers] = useState<any[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'new' | 'premium'>('all');
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then(r => r.json())
      .then(d => setHealth(d))
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const qpToken = url.searchParams.get('token');
      if (qpToken) {
        setToken(qpToken);
        localStorage.setItem('admin_jwt', qpToken);
        url.searchParams.delete('token');
        window.history.replaceState(null, '', url.toString());
      }
    } catch {}
  }, []);

  function adminHeaders() {
    const h: Record<string, string> = {};
    if (ADMIN_API_KEY) h['x-admin-api-key'] = ADMIN_API_KEY;
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async function doAuth(path: 'login' | 'register') {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.token) {
      setToken(data.token);
      localStorage.setItem('admin_jwt', data.token);
      await Promise.allSettled([loadRecipes(), loadUsers(), loadStats(), loadLatestComments()]);
    }
  }

  // Load logged-in user email when token changes
  useEffect(() => {
    if (!token) { setAdminEmail(''); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setAdminEmail(d?.email || ''))
      .catch(() => setAdminEmail(''));
  }, [token]);

  async function loadRecipes() {
    let res: Response;
    if (ADMIN_API_KEY || token) {
      res = await fetch(`${API}/api/admin/recipes?status=all`, { headers: adminHeaders() });
    } else {
      res = await fetch(`${API}/api/recipes`);
    }
    const data = await res.json();
    setRecipes(data.recipes ?? []);
  }

  async function loadUsers() {
    const params = new URLSearchParams();
    params.set('status', userFilter);
    if (userQuery) params.set('q', userQuery);
    const res = await fetch(`${API}/api/admin/users?${params.toString()}`, {
      headers: adminHeaders()
    });
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function loadStats() {
    const res = await fetch(`${API}/api/admin/stats`, { headers: adminHeaders() });
    const data = await res.json();
    setStats(data || null);
  }

  async function loadLatestComments() {
    const res = await fetch(`${API}/api/admin/comments`, { headers: adminHeaders() });
    const data = await res.json();
    setLatestComments(data.comments || []);
  }

  async function loadRecipeComments(recipeId: string) {
    if (!recipeId) return;
    const res = await fetch(`${API}/api/recipes/${recipeId}/comments`);
    const data = await res.json();
    setRecipeComments(data.comments || []);
  }

  function addPlanRow() {
    setPlan(prev => prev.concat({ planned_date: weekStart, meal_slot: 'dinner', recipe_id: recipes[0]?.id || '', servings: 2 }));
  }

  useEffect(() => {
    // Auto-initialize admin data only if we have a key or a token
    if (ADMIN_API_KEY || token) {
      loadRecipes();
      loadUsers();
      loadStats();
      loadLatestComments();
    } else {
      // Load public recipes list as a fallback for dropdowns
      loadRecipes();
    }
  }, [token]);

  const needsLogin = !ADMIN_API_KEY && !token;

  const webOnline = health?.status === 'ok';
  const dbOnline = health?.db === 'ok';

  return (
    <div className="stack" style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <div className="admin-header">
        <h1>{t('adminDashboard')}</h1>
        <div className="inline">
          <a href={PUBLIC_WEB_BASE} title="Back to site">← Back</a>
          <span className="badge">Admin</span>
          <span className="admin-meta">{adminEmail ? `Logged in as ${adminEmail}` : (ADMIN_API_KEY ? 'API key mode' : 'Not logged in')}</span>
          <label>{t('language')}:</label>
          <select value={getLang()} onChange={e => setLang(e.target.value as any)}>
            <option value="en">EN</option>
            <option value="lv">LV</option>
            <option value="ru">RU</option>
          </select>
        </div>
      </div>

      <section className="stack" aria-label="System status">
        <div className="status-row">
          <span className="status-pill" data-status={webOnline ? 'ok' : 'error'}>
            <span className="dot" data-status={webOnline ? 'ok' : 'error'}></span>
            Web server {webOnline ? 'online' : 'offline'}
          </span>
          <span className="status-pill" data-status={dbOnline ? 'ok' : 'error'}>
            <span className="dot" data-status={dbOnline ? 'ok' : 'error'}></span>
            Database {dbOnline ? 'online' : 'offline'}
          </span>
          <span className="status-pill count">Users: {stats?.total_users ?? '—'}</span>
          <span className="status-pill count">Recipes: {stats?.total_recipes ?? '—'}</span>
          <span className="status-pill count">Comments: {stats?.total_comments ?? '—'}</span>
          <span className="status-pill count">Ratings: {stats?.total_ratings ?? '—'}</span>
        </div>
        <div className="admin-meta">
          API: {API || '—'} · Static: {STATIC_BASE || '—'} {health?.durationMs != null ? `· ping ${health.durationMs}ms` : ''}
        </div>
      </section>

      {/* Removed quick nav links */}

      {needsLogin && (
        <section id="auth" style={{ marginTop: 8 }}>
          <h2>Auth</h2>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={() => doAuth('login')}>Login</button>
          <button onClick={() => doAuth('register')}>Register</button>
          <div>Token: {token ? token.slice(0, 16) + '...' : '—'}</div>
        </section>
      )}

      <section id="recipes">
        <h2>{t('recipes')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button data-variant="primary" onClick={loadRecipes}>Load</button>
        </div>
        <ul>
          {recipes.map(r => (
            <li key={r.id} className="inline" style={{ gap: 8 }}>
              {toImageUrl(r.cover_image) && <img src={toImageUrl(r.cover_image)} alt="" width={40} height={28} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />}
              <span>{r.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="comments">
        <h2>{t('comments')}</h2>
        <div className="stack">
          <div className="inline" style={{ marginBottom: 8 }}>
            <select value={selectedRecipeId} onChange={e => { setSelectedRecipeId(e.target.value); if (e.target.value) loadRecipeComments(e.target.value); }}>
              <option value="">— choose recipe —</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <input style={{ width: 400 }} placeholder="Add comment (selected recipe)" value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
            <button data-variant="primary" disabled={!selectedRecipeId || !ratingComment || (!ADMIN_API_KEY && !token)} onClick={async () => {
              const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...adminHeaders() },
                body: JSON.stringify({ content: ratingComment })
              });
              if (res.ok) {
                await loadRecipeComments(selectedRecipeId);
                setRatingComment('');
              }
            }}>Post</button>
            <button onClick={loadLatestComments} disabled={!ADMIN_API_KEY && !token}>Load latest site-wide</button>
          </div>
          <div className="inline" style={{ alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h3>Selected recipe comments</h3>
              <ul>
                {recipeComments.map((c: any) => (
                  <li key={c.id}>💬 {c.content} <span className="admin-meta">({new Date(c.created_at).toLocaleString()})</span></li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h3>Latest comments</h3>
              <ul>
                {latestComments.map((c: any) => (
                  <li key={c.id}>💬 {c.content} <span className="admin-meta">by {c.email} on {c.recipe_title}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="users">
        <h2>Users</h2>
        <div className="inline" style={{ gap: 8, marginBottom: 8 }}>
          <select value={userFilter} onChange={e => setUserFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="new">New (7d)</option>
            <option value="premium">Premium</option>
          </select>
          <input placeholder="Search email" value={userQuery} onChange={e => setUserQuery(e.target.value)} />
          <button onClick={loadUsers} disabled={!ADMIN_API_KEY && !token}>Refresh</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Admin</th>
              <th>Premium</th>
              <th>Premium until</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.is_admin ? 'Yes' : 'No'}</td>
                <td>{u.is_premium ? 'Yes' : 'No'}</td>
                <td>{u.premium_expires_at || '—'}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={async () => {
                    await fetch(`${API}/api/admin/users/${u.id}/premium`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
                      body: JSON.stringify({ isPremium: true, premiumExpiresAt: null })
                    });
                  }} disabled={!ADMIN_API_KEY && !token}>Add premium</button>
                  <button style={{ marginLeft: 6 }} onClick={async () => {
                    await fetch(`${API}/api/admin/users/${u.id}/premium`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
                      body: JSON.stringify({ isPremium: false, premiumExpiresAt: null })
                    });
                  }} disabled={!ADMIN_API_KEY && !token}>Revoke</button>
                  <button style={{ marginLeft: 6 }} onClick={async () => {
                    await fetch(`${API}/api/admin/users/${u.id}/admin`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
                      body: JSON.stringify({ isAdmin: !u.is_admin })
                    });
                    await loadUsers();
                  }} disabled={!ADMIN_API_KEY && !token}>{`Set ${u.is_admin ? 'User' : 'Admin'}`}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {/* Removed other admin sections for now */}
    </div>
  );
}
// Recipe CRUD removed for now