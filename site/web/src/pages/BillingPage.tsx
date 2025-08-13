import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const BillingPage: React.FC = () => {
  const { token, isPremium, authorizedFetch, refreshStatus } = useAuth();
  const [status, setStatus] = useState('');

  useEffect(() => { refreshStatus().catch(() => {}); }, []);

  if (!token) return <div>Please login to manage your subscription.</div>;

  const startCheckout = async () => {
    setStatus('Redirecting to checkout...');
    const origin = window.location.origin;
    const res = await authorizedFetch(`${API_BASE_URL}/api/billing/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ successUrl: `${origin}/billing`, cancelUrl: `${origin}/billing` })
    });
    const data = await res.json();
    if (res.ok && data.url) window.location.href = data.url;
    else setStatus(data.error || 'Error');
  };

  const openPortal = async () => {
    setStatus('Opening portal...');
    const origin = window.location.origin;
    const res = await authorizedFetch(`${API_BASE_URL}/api/billing/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: `${origin}/billing` })
    });
    const data = await res.json();
    if (res.ok && data.url) window.location.href = data.url;
    else setStatus(data.error || 'Error');
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-2">Premium</h1>
      <div className="text-sm text-gray-700 mb-4">
        Unlock premium features: price comparisons, grocery cost estimation, and access to premium-only recipes.
      </div>
      <div className="mb-2">Status: {isPremium ? 'Active' : 'Free'}</div>
      {!isPremium && (
        <div className="mb-4 p-3 border rounded">
          <div className="font-medium">€3.99/month</div>
          <div className="text-sm text-gray-600">Cancel anytime.</div>
        </div>
      )}
      <div className="flex gap-2">
        {!isPremium && <button onClick={startCheckout} className="btn btn-primary">Go Premium</button>}
        {isPremium && <button onClick={openPortal} className="btn btn-secondary">Manage subscription</button>}
      </div>
      <div className="text-sm text-gray-700 mt-2">{status}</div>
    </div>
  );
};