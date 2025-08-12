import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AuthProvider, useAuth } from './auth/AuthContext';

function NavBar() {
  const { token, logout } = useAuth();
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">Latvian Recipes</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/recipes" className="hover:underline">Browse</Link>
          <Link to="/favorites" className="hover:underline">Favorites</Link>
          {token ? (
            <button onClick={logout} className="px-3 py-1 rounded bg-gray-900 text-white text-sm">Logout</button>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};