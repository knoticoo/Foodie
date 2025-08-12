import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const AdsBanner: React.FC<{ placement: string }> = ({ placement }) => {
  const { token } = useAuth();
  const [ads, setAds] = useState<{ id: string; image_url: string; target_url: string }[]>([]);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`${API_BASE_URL}/api/ads?placement=${encodeURIComponent(placement)}`, { headers })
      .then(r => r.json())
      .then(d => setAds(Array.isArray(d?.ads) ? d.ads : []))
      .catch(() => setAds([]));
  }, [placement, token]);

  if (ads.length === 0) return null;

  return (
    <div className="w-full flex flex-wrap gap-3">
      {ads.map(ad => (
        <a key={ad.id} href={ad.target_url} target="_blank" rel="noreferrer">
          <img src={ad.image_url} alt="Ad" className="max-h-24 rounded border" />
        </a>
      ))}
    </div>
  );
};