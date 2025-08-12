import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.json()).then(d => setHealth(JSON.stringify(d))).catch(() => setHealth('error'));
  }, []);

  async function loadRecipes() {
    const res = await fetch(`${API}/api/recipes`);
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
    if (res.ok && data.token) setToken(data.token);
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

  function addPlanRow() {
    setPlan(prev => prev.concat({ planned_date: weekStart, meal_slot: 'dinner', recipe_id: recipes[0]?.id || '', servings: 2 }));
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 900 }}>
      <h1>Admin Dashboard</h1>
      <p>API: {API}</p>
      <p>Health: {health}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Auth</h2>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => doAuth('register')}>Register</button>
        <button onClick={() => doAuth('login')}>Login</button>
        <div>Token: {token ? token.slice(0, 16) + '...' : '—'}</div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recipes</h2>
        <button onClick={loadRecipes}>Load</button>
        <ul>
          {recipes.map(r => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Weekly Planner</h2>
        <div>
          <input type="date" placeholder="Week start (YYYY-MM-DD)" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
          <button onClick={loadWeekPlan} disabled={!token || !weekStart}>Load plan</button>
          <button onClick={saveWeekPlan} disabled={!token || !weekStart}>Save plan</button>
          <span style={{ marginLeft: 8 }}>{planStatus}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={addPlanRow} disabled={!weekStart || recipes.length === 0}>Add row</button>
        </div>
        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
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

      <section style={{ marginTop: 24 }}>
        <h2>Preferences</h2>
        <div>
          <button onClick={loadPreferences} disabled={!token}>Load</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Diet (comma separated): </label>
          <input style={{ width: 400 }} placeholder="vegan,keto,budget" value={dietPreferences} onChange={e => setDietPreferences(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Budget cents: </label>
          <input type="number" placeholder="2000" value={budgetCents} onChange={e => setBudgetCents(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={savePreferences} disabled={!token}>Save</button>
          <span style={{ marginLeft: 8 }}>{prefsStatus}</span>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recommendations</h2>
        <button onClick={loadRecommendations} disabled={!token}>Load</button>
        <ul>
          {recommendations.map(r => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}