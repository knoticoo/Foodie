import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL;

export function App() {
  const [health, setHealth] = useState<string>('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

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

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 800 }}>
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
    </div>
  );
}