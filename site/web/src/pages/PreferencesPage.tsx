import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const PreferencesPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [dietPreferences, setDietPreferences] = useState('');
  const [budgetCents, setBudgetCents] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) return;
    authorizedFetch(`${API_BASE_URL}/api/preferences`).then(r => r.json()).then(d => {
      setDietPreferences((d?.dietPreferences || []).join(','));
      setBudgetCents(d?.budgetCents != null ? String(d.budgetCents) : '');
    });
  }, [token]);

  if (!token) return <div>Please login to manage your preferences.</div>;

  const onSave = async () => {
    setStatus('Saving...');
    const res = await authorizedFetch(`${API_BASE_URL}/api/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dietPreferences: dietPreferences.split(',').map(s => s.trim()).filter(Boolean),
        budgetCents: budgetCents ? Number(budgetCents) : null
      })
    });
    setStatus(res.status === 204 ? 'Saved' : 'Error');
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Preferences</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Diet preferences (comma-separated)</label>
          <input className="w-full border rounded px-3 py-2" value={dietPreferences} onChange={e => setDietPreferences(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Budget (cents)</label>
          <input className="w-full border rounded px-3 py-2" value={budgetCents} onChange={e => setBudgetCents(e.target.value)} />
        </div>
        <button onClick={onSave} className="px-4 py-2 rounded bg-gray-900 text-white">Save</button>
        <div className="text-sm text-gray-700">{status}</div>
      </div>
    </div>
  );
};