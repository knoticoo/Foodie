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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preferences</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diet preferences (comma-separated)
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500" 
              value={dietPreferences} 
              onChange={e => setDietPreferences(e.target.value)}
              placeholder="e.g., vegetarian, gluten-free, dairy-free"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (cents)
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500" 
              value={budgetCents} 
              onChange={e => setBudgetCents(e.target.value)}
              placeholder="e.g., 1000 (for $10.00)"
              type="number"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={onSave} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Save Preferences
            </button>
          </div>
          {status && (
            <div className="text-sm text-center p-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};