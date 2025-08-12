import React, { useEffect, useState } from 'react';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const App: React.FC = () => {
  const [health, setHealth] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then(res => res.text())
      .then(setHealth)
      .catch(err => setError(String(err)));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24, lineHeight: 1.5 }}>
      <h1>Latvian Recipes</h1>
      <p>Welcome! This is the public site for browsing recipes. UI is a starter — extend as needed.</p>

      <section style={{ marginTop: 24 }}>
        <h2>API status</h2>
        {health && <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 8 }}>{health}</pre>}
        {error && <p style={{ color: 'crimson' }}>Failed to reach API: {error}</p>}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Quick links</h2>
        <ul>
          <li><a href={`http://${window.location.hostname}:3000/api/health`} target="_blank">API health</a></li>
          <li><a href={`http://${window.location.hostname}:8080/images/`} target="_blank">Static images</a></li>
          <li><a href={`http://${window.location.hostname}:5173`} target="_blank">Admin panel</a></li>
        </ul>
      </section>
    </div>
  );
};