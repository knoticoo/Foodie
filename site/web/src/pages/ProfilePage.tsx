import React from 'react';
import { FavoritesPage } from './FavoritesPage';
import { PreferencesPage } from './PreferencesPage';
import { useAuth } from '../auth/AuthContext';

export const ProfilePage: React.FC = () => {
  const { token } = useAuth();
  if (!token) return <div>Please login to view your profile.</div>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-1">Your profile</h1>
        <p className="text-sm text-gray-700">Manage your favorites and cooking preferences.</p>
      </div>
      <section>
        <h2 className="font-medium mb-2">Favorites</h2>
        <div className="border rounded p-3 bg-white">
          <FavoritesPage />
        </div>
      </section>
      <section>
        <h2 className="font-medium mb-2">Preferences</h2>
        <div className="border rounded p-3 bg-white">
          <PreferencesPage />
        </div>
      </section>
      <div className="flex gap-2">
        <a href="/planner" className="px-3 py-2 rounded bg-gray-200">Open planner</a>
        <a href="/billing" className="px-3 py-2 rounded bg-gray-200">Manage premium</a>
      </div>
    </div>
  );
};