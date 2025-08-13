import React, { useEffect, useState } from 'react';
import { t, setLang, getLang } from './i18n';

const API = (import.meta as any).env?.VITE_API_BASE_URL || window.__VITE__?.VITE_API_BASE_URL || '';
const STATIC_BASE = (import.meta as any).env?.VITE_STATIC_BASE_URL || window.__VITE__?.VITE_STATIC_BASE_URL || '';

function toImageUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${STATIC_BASE}${src}`;
  return `${STATIC_BASE}/${src}`;
}

export function App() {
  const [health, setHealth] = useState<string>('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

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

  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitImages, setSubmitImages] = useState(''); // comma-separated URLs
  const [submitStatus, setSubmitStatus] = useState('');

  const [dataUrl, setDataUrl] = useState('');
  const [uploadPath, setUploadPath] = useState('');

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
    fetch(`${API}/api/health`).then(r => r.json()).then(d => setHealth(JSON.stringify(d))).catch(() => setHealth('error'));
  }, []);

  async function loadRecipes() {
    let res: Response;
    if (token) {
      res = await fetch(`${API}/api/admin/recipes?status=all`, { headers: { Authorization: `Bearer ${token}` } });
    } else {
      res = await fetch(`${API}/api/recipes`);
    }
    const data = await res.json();
    setRecipes(data.recipes ?? []);
  }

  async function doAuth(path: 'login' | 'register') {
    const res = await fetch(`${API}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      try { await loadRecipes(); } catch {}
      try { await loadRecommendations(); } catch {}
      try { await loadUsers(); } catch {}
    }
  }

  async function loadWeekPlan() {
    if (!token || !weekStart) return;
    setPlanStatus('Loading...');
    const res = await fetch(`${API}/api/planner/week?weekStart=${encodeURIComponent(weekStart)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setPlan(data.items ?? []);
      setPlanStatus('Loaded');
    } else {
      setPlanStatus(data.error || 'Error');
    }
  }

  async function saveWeekPlan() {
    if (!token || !weekStart) return;
    setPlanStatus('Saving...');
    const res = await fetch(`${API}/api/planner/week`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ weekStart, items: plan.map(p => ({ date: p.planned_date, mealSlot: p.meal_slot, recipeId: p.recipe_id, servings: p.servings })) })
    });
    if (res.status === 204) {
      setPlanStatus('Saved');
    } else {
      const data = await res.json().catch(() => ({}));
      setPlanStatus(data.error || 'Error');
    }
  }

  async function loadPreferences() {
    if (!token) return;
    setPrefsStatus('Loading...');
    const res = await fetch(`${API}/api/preferences`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      setDietPreferences((data.dietPreferences || []).join(','));
      setBudgetCents(String(data.budgetCents ?? ''));
      setPrefsStatus('Loaded');
    } else {
      setPrefsStatus(data.error || 'Error');
    }
  }

  async function savePreferences() {
    if (!token) return;
    setPrefsStatus('Saving...');
    const res = await fetch(`${API}/api/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        dietPreferences: dietPreferences.split(',').map(s => s.trim()).filter(Boolean),
        budgetCents: budgetCents ? Number(budgetCents) : null
      })
    });
    if (res.status === 204) setPrefsStatus('Saved');
    else {
      const data = await res.json().catch(() => ({}));
      setPrefsStatus(data.error || 'Error');
    }
  }

  async function loadRecommendations() {
    if (!token) return;
    const res = await fetch(`${API}/api/recommendations`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecommendations(data.recipes || []);
  }

  async function loadUsers() {
    if (!token) return;
    const params = new URLSearchParams();
    params.set('status', userFilter);
    if (userQuery) params.set('q', userQuery);
    const res = await fetch(`${API}/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data.users || []);
  }

  function addPlanRow() {
    setPlan(prev => prev.concat({ planned_date: weekStart, meal_slot: 'dinner', recipe_id: recipes[0]?.id || '', servings: 2 }));
  }

  return (
    <div className="stack" style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <div className="admin-header">
        <h1>{t('adminDashboard')}</h1>
        <div className="inline">
          <span className="badge">Admin</span>
          <label>{t('language')}:</label>
          <select value={getLang()} onChange={e => setLang(e.target.value as any)}>
            <option value="en">EN</option>
            <option value="lv">LV</option>
            <option value="ru">RU</option>
          </select>
        </div>
      </div>
      <div className="admin-meta">API: {API} · Static: {STATIC_BASE || '—'} · Health: {health || '—'}</div>
      <nav className="admin-tabs">
        <a href="#auth">Auth</a>
        <a href="#users">Users</a>
        <a href="#monetization">Monetization</a>
        <a href="#recipes">Recipes</a>
        <a href="#planner">Planner</a>
        <a href="#recipe-crud">Recipe CRUD</a>
      </nav>

      <section id="auth" style={{ marginTop: 24 }}>
        <h2>Auth</h2>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => doAuth('register')}>Register</button>
        <button onClick={() => doAuth('login')}>Login</button>
        <div>Token: {token ? token.slice(0, 16) + '...' : '—'}</div>
      </section>

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

      <section id="planner">
        <h2>{t('weeklyPlanner')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <input type="date" placeholder="Week start (YYYY-MM-DD)" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
          <button onClick={loadWeekPlan} disabled={!token || !weekStart}>Load plan</button>
          <button data-variant="primary" onClick={saveWeekPlan} disabled={!token || !weekStart}>Save plan</button>
          <span className="admin-meta">{planStatus}</span>
        </div>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button onClick={addPlanRow} disabled={!weekStart || recipes.length === 0}>Add row</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Date</th>
              <th style={{ textAlign: 'left' }}>Meal</th>
              <th style={{ textAlign: 'left' }}>Recipe</th>
              <th style={{ textAlign: 'left' }}>Servings</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <input type="date" value={row.planned_date} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, planned_date: e.target.value } : r))} />
                </td>
                <td>
                  <select value={row.meal_slot} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, meal_slot: e.target.value } : r))}>
                    <option value="breakfast">breakfast</option>
                    <option value="lunch">lunch</option>
                    <option value="dinner">dinner</option>
                    <option value="snack">snack</option>
                  </select>
                </td>
                <td>
                  <select value={row.recipe_id} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, recipe_id: e.target.value } : r))}>
                    <option value="">— choose —</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="number" min={1} value={row.servings ?? 2} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, servings: Number(e.target.value || 2) } : r))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8 }}>
          <button onClick={async () => {
            if (!token || !weekStart) return;
            const res = await fetch(`${API}/api/planner/week/grocery-list?weekStart=${encodeURIComponent(weekStart)}&includeCost=true`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            alert(JSON.stringify(data));
          }}>Generate Grocery List</button>
        </div>
      </section>

            <section>
        <h2>{t('preferences')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button onClick={loadPreferences} disabled={!token}>Load</button>
        </div>
        <div className="stack">
          <label>Diet (comma separated):</label>
          <input style={{ width: 400 }} placeholder="vegan,keto,budget" value={dietPreferences} onChange={e => setDietPreferences(e.target.value)} />
          <label>Budget cents:</label>
          <input type="number" placeholder="2000" value={budgetCents} onChange={e => setBudgetCents(e.target.value)} />
          <div className="inline">
            <button data-variant="primary" onClick={savePreferences} disabled={!token}>Save</button>
            <span className="admin-meta">{prefsStatus}</span>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('recommendations')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button onClick={loadRecommendations} disabled={!token}>Load</button>
        </div>
        <ul>
          {recommendations.map(r => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('submitRecipe')}</h2>
        <div className="stack">
          <input style={{ width: 400 }} placeholder="Title" value={submitTitle} onChange={e => setSubmitTitle(e.target.value)} />
          <textarea style={{ width: 400, height: 80 }} placeholder="Description" value={submitDescription} onChange={e => setSubmitDescription(e.target.value)} />
          <input style={{ width: 400 }} placeholder="Image URLs (comma separated)" value={submitImages} onChange={e => setSubmitImages(e.target.value)} />
          <div className="inline">
            <button data-variant="primary" disabled={!token || !submitTitle} onClick={async () => {
              setSubmitStatus('Submitting...');
              const body = {
                title: submitTitle,
                description: submitDescription,
                images: submitImages.split(',').map(s => s.trim()).filter(Boolean)
              };
              const res = await fetch(`${API}/api/recipes/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
              });
              const data = await res.json().catch(() => ({}));
              setSubmitStatus(res.ok ? `Submitted (id=${data.id}, share=${data.shareToken})` : (data.error || 'Error'));
            }}>Submit</button>
            <span className="admin-meta">{submitStatus}</span>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('uploadImage')}</h2>
        <div className="stack">
          <textarea style={{ width: 500, height: 120 }} placeholder="Paste data URL (data:image/png;base64,...)" value={dataUrl} onChange={e => setDataUrl(e.target.value)} />
          <div className="inline">
            <button data-variant="primary" disabled={!token || !dataUrl} onClick={async () => {
              const res = await fetch(`${API}/api/uploads/image-base64`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ dataUrl })
              });
              const data = await res.json().catch(() => ({}));
              setUploadPath(res.ok ? data.path : (data.error || 'Error'));
            }}>Upload</button>
            <span className="admin-meta">Saved: {uploadPath || '—'}</span>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('ratings')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
            <option value="">— choose recipe —</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button onClick={async () => {
            if (!selectedRecipeId) return;
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`);
            const data = await res.json();
            setRatings(data.ratings || []);
          }}>Load Ratings</button>
        </div>
        <div className="inline" style={{ marginBottom: 8 }}>
          <label>Rating:</label>
          <input type="number" min={1} max={5} value={ratingValue} onChange={e => setRatingValue(Number(e.target.value))} />
          <input style={{ width: 400 }} placeholder="Comment" value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
          <button data-variant="primary" disabled={!token || !selectedRecipeId} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ rating: ratingValue, comment: ratingComment })
            });
            if (res.status === 204) {
              const res2 = await fetch(`${API}/api/recipes/${selectedRecipeId}/ratings`);
              const data2 = await res2.json();
              setRatings(data2.ratings || []);
            }
          }}>Submit</button>
        </div>
        <ul>
          {ratings.map((r, i) => (
            <li key={i}>⭐ {r.rating} — {r.comment || ''}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Challenges</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button onClick={async () => {
            const res = await fetch(`${API}/api/challenges`);
            const data = await res.json();
            setChallenges(data.challenges || []);
          }}>Load</button>
        </div>
        <ul>
          {challenges.map((c: any) => (
            <li key={c.id}>{c.title} ({c.start_date} → {c.end_date})</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t('comments')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
            <option value="">— choose recipe —</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <button onClick={async () => {
            if (!selectedRecipeId) return;
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`);
            const data = await res.json();
            // reuse ratings state to show comments list quickly
            setRatings((data.comments || []).map((c: any) => ({ rating: '', comment: c.content })));
          }}>Load Comments</button>
        </div>
        <div className="inline" style={{ marginBottom: 8 }}>
          <input style={{ width: 400 }} placeholder="Add comment" value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
          <button data-variant="primary" disabled={!token || !selectedRecipeId || !ratingComment} onClick={async () => {
            const res = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ content: ratingComment })
            });
            if (res.ok) {
              const res2 = await fetch(`${API}/api/recipes/${selectedRecipeId}/comments`);
              const data2 = await res2.json();
              setRatings((data2.comments || []).map((c: any) => ({ rating: '', comment: c.content })));
              setRatingComment('');
            }
          }}>Post</button>
        </div>
      </section>

      <section>
        <h2>{t('approvals')}</h2>
        <div className="inline" style={{ marginBottom: 8 }}>
          <button onClick={async () => {
            if (!token) return;
            const res = await fetch(`${API}/api/admin/recipes?status=pending`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setPendingRecipes(data.recipes || []);
          }}>Load Pending</button>
        </div>
        <ul>
          {pendingRecipes.map((r: any) => (
            <li key={r.id} className="inline" style={{ gap: 8 }}>
              {toImageUrl(r.cover_image) && <img src={toImageUrl(r.cover_image)} alt="" width={40} height={28} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />}
              <span>{r.title}</span>
              <button data-variant="primary" style={{ marginLeft: 8 }} disabled={!token} onClick={async () => {
                await fetch(`${API}/api/admin/recipes/${r.id}/approval`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ isApproved: true })
                });
              }}>Approve</button>
            </li>
          ))}
        </ul>
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
          <button onClick={loadUsers}>Refresh</button>
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
                  <button disabled={!token} onClick={async () => {
                    await fetch(`${API}/api/admin/users/${u.id}/premium`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ isPremium: true, premiumExpiresAt: null })
                    });
                  }}>Add premium</button>
                  <button style={{ marginLeft: 6 }} disabled={!token} onClick={async () => {
                    await fetch(`${API}/api/admin/users/${u.id}/premium`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ isPremium: false, premiumExpiresAt: null })
                    });
                  }}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t('challenges')}</h2>
        <div>
          <input placeholder="Title" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} />
          <input placeholder="Start (YYYY-MM-DD)" value={newChallenge.start} onChange={e => setNewChallenge({ ...newChallenge, start: e.target.value })} />
          <input placeholder="End (YYYY-MM-DD)" value={newChallenge.end} onChange={e => setNewChallenge({ ...newChallenge, end: e.target.value })} />
          <button disabled={!token || !newChallenge.title} onClick={async () => {
            await fetch(`${API}/api/admin/challenges`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ title: newChallenge.title, start_date: newChallenge.start, end_date: newChallenge.end, description: '' })
            });
          }}>Create</button>
        </div>
      </section>

      <section id="monetization">
        <h2>{t('monetization')}</h2>
        <div style={{ background:'#fffbe6', border:'1px solid #ffe58f', color:'#613400', padding:8, margin:'8px 0 12px 0', borderRadius: 8 }}>
          Billing (Stripe) is deferred until all phases are complete. Stub endpoints are used; no API keys required here.
        </div>
        <div style={{ border: '1px solid var(--border)', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>Set Premium for User</h3>
          <input style={{ width: 340 }} placeholder="User ID" value={premiumUserId} onChange={e => setPremiumUserId(e.target.value)} />
          <input style={{ width: 220, marginLeft: 8 }} type="datetime-local" placeholder="Expires at (optional)" value={premiumUntil} onChange={e => setPremiumUntil(e.target.value)} />
          <button data-variant="primary" disabled={!token || !premiumUserId} onClick={async () => {
            await fetch(`${API}/api/admin/users/${premiumUserId}/premium`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ isPremium: true, premiumExpiresAt: premiumUntil || null })
            });
          }}>Add premium</button>
          <button style={{ marginLeft: 8 }} disabled={!token || !premiumUserId} onClick={async () => {
            await fetch(`${API}/api/admin/users/${premiumUserId}/premium`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ isPremium: false, premiumExpiresAt: null })
            });
          }}>Remove premium</button>
        </div>

        <div style={{ border: '1px solid var(--border)', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <h3>Recipe Sponsorship</h3>
          <div className="inline" style={{ flexWrap: 'wrap' as any, gap: 8 }}>
            <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
              <option value="">— choose recipe —</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <input placeholder="Sponsor Name" value={sponsorName} onChange={e => setSponsorName(e.target.value)} />
            <input style={{ width: 300 }} placeholder="Sponsor URL" value={sponsorUrl} onChange={e => setSponsorUrl(e.target.value)} />
            <label>
              <input type="checkbox" checked={premiumOnly} onChange={e => setPremiumOnly(e.target.checked)} /> Premium-only
            </label>
            <button data-variant="primary" disabled={!token || !selectedRecipeId} onClick={async () => {
              await fetch(`${API}/api/admin/recipes/${selectedRecipeId}/sponsorship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isSponsored: true, sponsorName, sponsorUrl, isPremiumOnly: premiumOnly })
              });
            }}>Save</button>
            <button disabled={!token || !selectedRecipeId} onClick={async () => {
              await fetch(`${API}/api/admin/recipes/${selectedRecipeId}/sponsorship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isSponsored: false, sponsorName: null, sponsorUrl: null, isPremiumOnly: false })
              });
            }}>Clear</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
          <h3>Ads</h3>
          <div>
            <input placeholder="Placement" value={adPlacement} onChange={e => setAdPlacement(e.target.value)} />
            <input placeholder="Image URL" value={adImageUrl} onChange={e => setAdImageUrl(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            <input placeholder="Target URL" value={adTargetUrl} onChange={e => setAdTargetUrl(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
            <button style={{ marginLeft: 8 }} disabled={!token || !adPlacement || !adImageUrl || !adTargetUrl} onClick={async () => {
              await fetch(`${API}/api/ads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ placement: adPlacement, image_url: adImageUrl, target_url: adTargetUrl, is_active: true })
              });
            }}>Create Ad</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12 }}>
          <h3>Affiliate Template</h3>
          <div>
            <input placeholder="Store ID" value={storeId} onChange={e => setStoreId(e.target.value)} />
            <input placeholder="Template (use {query})" value={affiliateTemplate} onChange={e => setAffiliateTemplate(e.target.value)} style={{ marginLeft: 8, width: 500 }} />
            <button style={{ marginLeft: 8 }} disabled={!token || !storeId} onClick={async () => {
              await fetch(`${API}/api/admin/stores/${encodeURIComponent(storeId)}/affiliate-template`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ template: affiliateTemplate })
              });
            }}>Save Template</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 12 }}>
          <h3>Price Comparison (Premium)</h3>
          <input placeholder="Ingredient name" value={compareName} onChange={e => setCompareName(e.target.value)} />
          <select value={compareUnit} onChange={e => setCompareUnit(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="pcs">pcs</option>
          </select>
          <button style={{ marginLeft: 8 }} disabled={!token || !compareName} onClick={async () => {
            const res = await fetch(`${API}/api/prices/compare?name=${encodeURIComponent(compareName)}&unit=${encodeURIComponent(compareUnit)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCompareResult(JSON.stringify(data));
          }}>Compare</button>
          <div style={{ marginTop: 8 }}>
            <textarea style={{ width: 700, height: 140 }} value={compareResult} onChange={() => {}} />
          </div>
        </div>
      </section>

      <section id="recipe-crud">
        <h2>{t('recipeCrud')}</h2>
        <div style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 8 }}>
          <RecipeCrud API={API} token={token} onChange={loadRecipes} recipes={recipes} />
        </div>
      </section>
    </div>
  );
}

function RecipeCrud({ API, token, onChange, recipes }: { API: string; token: string; onChange: () => void; recipes: any[] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [servings, setServings] = useState<number>(2);
  const [totalTime, setTotalTime] = useState<string>('');
  const [selected, setSelected] = useState('');
  const [status, setStatus] = useState('');

  async function create() {
    setStatus('Creating...');
    const res = await fetch(`${API}/api/admin/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title,
        description,
        images: images.split(',').map(s => s.trim()).filter(Boolean),
        servings,
        total_time_minutes: totalTime ? Number(totalTime) : null,
        steps: [],
        nutrition: {},
        ingredients: []
      })
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? `Created id=${data.id}` : (data.error || 'Error'));
    if (res.ok) onChange();
  }

  async function update() {
    if (!selected) return;
    setStatus('Updating...');
    const res = await fetch(`${API}/api/admin/recipes/${selected}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: title || null,
        description: description || null,
        images: images ? images.split(',').map(s => s.trim()).filter(Boolean) : null,
        servings: servings || null,
        total_time_minutes: totalTime ? Number(totalTime) : null
      })
    });
    setStatus(res.status === 204 ? 'Updated' : 'Update failed');
    if (res.ok) onChange();
  }

  async function remove() {
    if (!selected) return;
    setStatus('Deleting...');
    const res = await fetch(`${API}/api/admin/recipes/${selected}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setStatus(res.status === 204 ? 'Deleted' : 'Delete failed');
    if (res.ok) onChange();
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">— select recipe —</option>
          {recipes.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: 300 }} />
        <input placeholder="Image URLs (comma)" value={images} onChange={e => setImages(e.target.value)} style={{ width: 260 }} />
        <input type="number" placeholder="Servings" value={servings} onChange={e => setServings(Number(e.target.value || 2))} />
        <input type="number" placeholder="Total time (min)" value={totalTime} onChange={e => setTotalTime(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button disabled={!token || !title} onClick={create}>Create</button>
        <button style={{ marginLeft: 8 }} disabled={!token || !selected} onClick={update}>Update</button>
        <button style={{ marginLeft: 8 }} disabled={!token || !selected} onClick={remove}>Delete</button>
        <span style={{ marginLeft: 8 }}>{status}</span>
      </div>
    </div>
  );
}