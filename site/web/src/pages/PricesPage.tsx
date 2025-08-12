import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const PricesPage: React.FC = () => {
  const { token, isPremium, authorizedFetch } = useAuth();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('g');
  const [cheapest, setCheapest] = useState<any | null>(null);
  const [compare, setCompare] = useState<any[] | null>(null);
  const [status, setStatus] = useState('');

  const doCheapest = async () => {
    setStatus('Loading...');
    setCheapest(null);
    setCompare(null);
    const res = await fetch(`${API_BASE_URL}/api/prices/cheapest?name=${encodeURIComponent(name)}&unit=${encodeURIComponent(unit)}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setCheapest(data); setStatus(''); } else setStatus(data.error || 'Error');
  };
  const doCompare = async () => {
    setStatus('Comparing...');
    setCompare(null);
    const res = await authorizedFetch(`${API_BASE_URL}/api/prices/compare?name=${encodeURIComponent(name)}&unit=${encodeURIComponent(unit)}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setCompare(Array.isArray(data?.options) ? data.options : []); setStatus(''); }
    else setStatus(data.error || 'Error');
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Prices</h1>
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-2" placeholder="ingredient name" value={name} onChange={e => setName(e.target.value)} />
        <select className="border rounded px-3 py-2" value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="pcs">pcs</option>
        </select>
        <button onClick={doCheapest} className="px-3 py-2 rounded bg-gray-200">Cheapest</button>
        {token && isPremium && (
          <button onClick={doCompare} className="px-3 py-2 rounded bg-gray-900 text-white">Compare</button>
        )}
      </div>
      {status && <div className="text-sm text-gray-700 mb-2">{status}</div>}
      {cheapest && (
        <div className="mb-4">
          <div className="font-medium">Cheapest match</div>
          <div className="text-sm text-gray-700">{cheapest.storeName} — {cheapest.productName} ({cheapest.unit})</div>
        </div>
      )}
      {compare && (
        <div>
          <div className="font-medium mb-2">Comparison</div>
          <ul className="list-disc ml-6 text-sm">
            {compare.map((opt: any, i: number) => (
              <li key={i}>
                {opt.storeName}: {opt.productName} — <a className="text-blue-600 underline" href={opt.affiliateUrl} target="_blank" rel="noreferrer">Buy</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!isPremium && token && (
        <div className="text-sm text-gray-600 mt-2">Upgrade to premium to compare prices across stores.</div>
      )}
    </div>
  );
};