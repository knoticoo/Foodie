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

  // Edit modals state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeModalStatus, setRecipeModalStatus] = useState('');
  const [recipeForm, setRecipeForm] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalStatus, setUserModalStatus] = useState('');
  const [userForm, setUserForm] = useState<any | null>(null);

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

  // Open recipe modal and preload data
  async function openRecipeModal(r: any) {
    setRecipeModalStatus('');
    // Seed with list data
    const base = {
      id: r.id,
      title: r.title || '',
      description: r.description || '',
      coverImageUrl: r.cover_image || '',
      servings: r.servings || 2,
      total_time_minutes: r.total_time_minutes || '',
      category: r.category || '',
      difficulty: r.difficulty || '',
      stepsJson: '[]',
      ingredientsJson: '[]'
    } as any;
    setRecipeForm(base);
    setIsRecipeModalOpen(true);
    // Try loading full details for steps/images/ingredients
    try {
      const res = await fetch(`${API}/api/recipes/${r.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} as any });
      if (res.ok) {
        const d = await res.json();
        setRecipeForm((prev: any) => prev && ({
          ...prev,
          title: d.title ?? prev.title,
          description: d.description ?? prev.description,
          coverImageUrl: Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : prev.coverImageUrl,
          servings: d.servings ?? prev.servings,
          total_time_minutes: d.total_time_minutes ?? prev.total_time_minutes,
          stepsJson: JSON.stringify(d.steps ?? [], null, 2),
          ingredientsJson: JSON.stringify(d.ingredients ?? [], null, 2)
        }));
      }
    } catch {}
  }

  async function saveRecipeModal() {
    if (!recipeForm) return;
    setRecipeModalStatus('Saving...');
    const payload: any = {
      title: recipeForm.title?.trim() || undefined,
      description: recipeForm.description ?? undefined,
      servings: recipeForm.servings ? Number(recipeForm.servings) : undefined,
      total_time_minutes: recipeForm.total_time_minutes !== '' ? Number(recipeForm.total_time_minutes) : undefined,
      category: recipeForm.category || undefined,
      difficulty: recipeForm.difficulty || undefined
    };
    // Images from coverImageUrl
    if (typeof recipeForm.coverImageUrl === 'string') payload.images = [recipeForm.coverImageUrl];
    // Optional JSON fields
    try { if (recipeForm.stepsJson && recipeForm.stepsJson.trim()) payload.steps = JSON.parse(recipeForm.stepsJson); } catch {}
    try { if (recipeForm.ingredientsJson && recipeForm.ingredientsJson.trim()) payload.ingredients = JSON.parse(recipeForm.ingredientsJson); } catch {}

    const res = await fetch(`${API}/api/admin/recipes/${recipeForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...adminHeaders() },
      body: JSON.stringify(payload)
    });
    if (res.status === 204) {
      setRecipeModalStatus('Saved');
      await loadRecipes();
      setIsRecipeModalOpen(false);
      setRecipeForm(null);
    } else {
      const err = await res.json().catch(() => ({}));
      setRecipeModalStatus(err?.error || 'Error');
    }
  }

  // User edit modal
  function openUserModal(u: any) {
    setUserModalStatus('');
    setUserForm({
      id: u.id,
      email: u.email,
      is_admin: Boolean(u.is_admin),
      is_premium: Boolean(u.is_premium),
      premium_expires_at: u.premium_expires_at || ''
    });
    setIsUserModalOpen(true);
  }

  async function saveUserModal() {
    if (!userForm) return;
    setUserModalStatus('Saving...');
    try {
      // Admin toggle
      await fetch(`${API}/api/admin/users/${userForm.id}/admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ isAdmin: !!userForm.is_admin })
      });
      // Premium settings
      await fetch(`${API}/api/admin/users/${userForm.id}/premium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders() },
        body: JSON.stringify({ isPremium: !!userForm.is_premium, premiumExpiresAt: userForm.premium_expires_at || null })
      });
      setUserModalStatus('Saved');
      await loadUsers();
      setIsUserModalOpen(false);
      setUserForm(null);
    } catch (e) {
      setUserModalStatus('Error');
    }
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
          <span className="status-pill" data-status={health ? (webOnline ? 'ok' : 'error') : 'unknown'}>
            <span className="dot" data-status={health ? (webOnline ? 'ok' : 'error') : 'unknown'}></span>
            Web server {health ? (webOnline ? 'online' : 'offline') : '—'}
          </span>
          <span className="status-pill" data-status={health ? (dbOnline ? 'ok' : 'error') : 'unknown'}>
            <span className="dot" data-status={health ? (dbOnline ? 'ok' : 'error') : 'unknown'}></span>
            Database {health ? (dbOnline ? 'online' : 'offline') : '—'}
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
              <span style={{ flex: 1 }}>{r.title}</span>
              <button onClick={() => openRecipeModal(r)} disabled={!ADMIN_API_KEY && !token}>Edit</button>
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
                  <button onClick={() => openUserModal(u)} disabled={!ADMIN_API_KEY && !token}>Edit</button>
                  <button style={{ marginLeft: 6 }} onClick={async () => {
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

      {/* Recipe edit modal */}
      {isRecipeModalOpen && recipeForm && (
        <div className="modal-backdrop" onClick={() => { setIsRecipeModalOpen(false); setRecipeForm(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="inline" style={{ justifyContent: 'space-between', width: '100%' }}>
              <h2>Edit recipe</h2>
              <button onClick={() => { setIsRecipeModalOpen(false); setRecipeForm(null); }}>✕</button>
            </div>
            <div className="stack">
              <label>
                <div>Title</div>
                <input value={recipeForm.title} onChange={e => setRecipeForm((f: any) => ({ ...f, title: e.target.value }))} />
              </label>
              <label>
                <div>Description</div>
                <textarea rows={3} value={recipeForm.description} onChange={e => setRecipeForm((f: any) => ({ ...f, description: e.target.value }))} />
              </label>
              <div className="inline" style={{ gap: 8 }}>
                <label style={{ flex: 1 }}>
                  <div>Servings</div>
                  <input type="number" min={1} value={recipeForm.servings} onChange={e => setRecipeForm((f: any) => ({ ...f, servings: Number(e.target.value || 1) }))} />
                </label>
                <label style={{ flex: 1 }}>
                  <div>Total time (min)</div>
                  <input type="number" min={0} value={recipeForm.total_time_minutes} onChange={e => setRecipeForm((f: any) => ({ ...f, total_time_minutes: e.target.value }))} />
                </label>
              </div>
              <div className="inline" style={{ gap: 8 }}>
                <label style={{ flex: 1 }}>
                  <div>Category</div>
                  <input value={recipeForm.category} onChange={e => setRecipeForm((f: any) => ({ ...f, category: e.target.value }))} />
                </label>
                <label style={{ flex: 1 }}>
                  <div>Difficulty</div>
                  <input value={recipeForm.difficulty} onChange={e => setRecipeForm((f: any) => ({ ...f, difficulty: e.target.value }))} />
                </label>
              </div>
              <label>
                <div>Cover image URL</div>
                <input value={recipeForm.coverImageUrl} onChange={e => setRecipeForm((f: any) => ({ ...f, coverImageUrl: e.target.value }))} />
              </label>
              <label>
                <div>Steps (JSON array)</div>
                <textarea rows={6} value={recipeForm.stepsJson} onChange={e => setRecipeForm((f: any) => ({ ...f, stepsJson: e.target.value }))} />
              </label>
              <label>
                <div>Ingredients (JSON array)</div>
                <textarea rows={6} value={recipeForm.ingredientsJson} onChange={e => setRecipeForm((f: any) => ({ ...f, ingredientsJson: e.target.value }))} />
              </label>
              <div className="inline" style={{ justifyContent: 'space-between' }}>
                <div className="admin-meta">{recipeModalStatus}</div>
                <div className="inline" style={{ gap: 8 }}>
                  <button onClick={() => { setIsRecipeModalOpen(false); setRecipeForm(null); }}>Cancel</button>
                  <button data-variant="primary" onClick={saveRecipeModal} disabled={!ADMIN_API_KEY && !token}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User edit modal */}
      {isUserModalOpen && userForm && (
        <div className="modal-backdrop" onClick={() => { setIsUserModalOpen(false); setUserForm(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="inline" style={{ justifyContent: 'space-between', width: '100%' }}>
              <h2>Edit user</h2>
              <button onClick={() => { setIsUserModalOpen(false); setUserForm(null); }}>✕</button>
            </div>
            <div className="stack">
              <div>
                <div>Email</div>
                <input value={userForm.email} disabled />
              </div>
              <div className="inline">
                <label className="inline" style={{ gap: 6 }}>
                  <input type="checkbox" checked={!!userForm.is_admin} onChange={e => setUserForm((f: any) => ({ ...f, is_admin: e.target.checked }))} /> Admin
                </label>
                <label className="inline" style={{ gap: 6 }}>
                  <input type="checkbox" checked={!!userForm.is_premium} onChange={e => setUserForm((f: any) => ({ ...f, is_premium: e.target.checked }))} /> Premium
                </label>
              </div>
              <label>
                <div>Premium until (ISO date, optional)</div>
                <input placeholder="YYYY-MM-DD or empty" value={userForm.premium_expires_at} onChange={e => setUserForm((f: any) => ({ ...f, premium_expires_at: e.target.value }))} />
              </label>
              <div className="inline" style={{ justifyContent: 'space-between' }}>
                <div className="admin-meta">{userModalStatus}</div>
                <div className="inline" style={{ gap: 8 }}>
                  <button onClick={() => { setIsUserModalOpen(false); setUserForm(null); }}>Cancel</button>
                  <button data-variant="primary" onClick={saveUserModal} disabled={!ADMIN_API_KEY && !token}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Removed other admin sections for now */}
    </div>
  );
}
// Recipe CRUD removed for now