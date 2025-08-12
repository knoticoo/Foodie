import React from 'react';
import { AdsBanner } from '../components/AdsBanner';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Discover recipes</h1>
      <p className="text-gray-600">Browse curated Latvian recipes and save your favorites.</p>
      <AdsBanner placement="home_top" />
    </div>
  );
};