import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type PlanRow = { planned_date: string; meal_slot: string; recipe_id: string; servings: number };

export const PlannerPage: React.FC = () => {
  const { token, authorizedFetch } = useAuth();
  const [weekStart, setWeekStart] = useState('');
  const [plan, setPlan] = useState<PlanRow[]>([]);
  const [status, setStatus] = useState('');
  const [grocery, setGrocery] = useState<any | null>(null);

  useEffect(() => {
    setPlan([]);
    setGrocery(null);
    setStatus('');
  }, [weekStart]);

  if (!token) return <div>Please login to use the planner.</div>;

  const loadPlan = async () => {
    if (!weekStart) return;
    setStatus('Loading...');
    const res = await authorizedFetch(`${API_BASE_URL}/api/planner/week?weekStart=${encodeURIComponent(weekStart)}`);
    const data = await res.json();
    if (res.ok) {
      setPlan((data.items || []).map((p: any) => ({
        planned_date: p.planned_date,
        meal_slot: p.meal_slot,
        recipe_id: p.recipe_id,
        servings: p.servings
      })));
      setStatus('Loaded');
    } else setStatus(data.error || 'Error');
  };

  const savePlan = async () => {
    if (!weekStart) return;
    setStatus('Saving...');
    const res = await authorizedFetch(`${API_BASE_URL}/api/planner/week`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, items: plan })
    });
    setStatus(res.status === 204 ? 'Saved' : 'Error');
  };

  const loadGrocery = async () => {
    if (!weekStart) return;
    setStatus('Building grocery list...');
    const res = await authorizedFetch(`${API_BASE_URL}/api/planner/week/grocery-list?weekStart=${encodeURIComponent(weekStart)}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setGrocery(data);
      setStatus('Grocery ready');
    } else if (res.status === 402) {
      setGrocery({ items: data.items });
      setStatus('Premium required for cost estimation');
    } else {
      setStatus(data.error || 'Error');
    }
  };

  const addRow = () => setPlan(p => p.concat({ planned_date: weekStart, meal_slot: 'dinner', recipe_id: '', servings: 2 }));

  const populateMockWeek = () => {
    if (!weekStart) return;
    const seed: PlanRow[] = [
      { planned_date: weekStart, meal_slot: 'breakfast', recipe_id: 'TEST-EGGS', servings: 2 },
      { planned_date: weekStart, meal_slot: 'lunch', recipe_id: 'TEST-SOUP', servings: 2 },
      { planned_date: weekStart, meal_slot: 'dinner', recipe_id: 'TEST-PASTA', servings: 2 }
    ];
    setPlan(seed);
    setStatus('Mock data added — save to persist');
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Weekly Planner</h1>
      <div className="flex items-center gap-2 mb-4">
        <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="input" />
        <button onClick={loadPlan} className="btn btn-secondary">Load</button>
        <button onClick={savePlan} className="btn btn-primary">Save</button>
        <button onClick={addRow} className="btn btn-secondary">Add row</button>
        <button onClick={loadGrocery} className="btn btn-secondary">Grocery list</button>
        <button onClick={populateMockWeek} className="btn btn-secondary">Add mock week</button>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="pb-2">Date</th>
            <th className="pb-2">Meal</th>
            <th className="pb-2">Recipe ID</th>
            <th className="pb-2">Servings</th>
          </tr>
        </thead>
        <tbody>
          {plan.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input type="date" className="border rounded px-2 py-1" value={row.planned_date} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, planned_date: e.target.value } : r))} />
              </td>
              <td>
                <select className="border rounded px-2 py-1" value={row.meal_slot} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, meal_slot: e.target.value } : r))}>
                  <option value="breakfast">breakfast</option>
                  <option value="lunch">lunch</option>
                  <option value="dinner">dinner</option>
                  <option value="snack">snack</option>
                </select>
              </td>
              <td>
                <input className="border rounded px-2 py-1 w-48" value={row.recipe_id} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, recipe_id: e.target.value } : r))} />
              </td>
              <td>
                <input type="number" min={1} className="border rounded px-2 py-1 w-20" value={row.servings} onChange={e => setPlan(p => p.map((r, i) => i === idx ? { ...r, servings: Number(e.target.value || 1) } : r))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {grocery && (
        <div className="mt-6">
          <h2 className="font-medium mb-2">Grocery list</h2>
          <ul className="list-disc ml-6">
            {(grocery.items || []).map((it: any, i: number) => (
              <li key={i}>{it.name} — {it.totalQuantity} {it.unit}</li>
            ))}
          </ul>
          {grocery.pricing && (
            <div className="mt-4">
              <h3 className="font-medium mb-1">Estimated pricing</h3>
              <div className="text-sm text-gray-700">Total: €{((grocery.pricing.totalCents || 0) / 100).toFixed(2)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};