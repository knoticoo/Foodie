import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SubmitRecipePage } from './pages/SubmitRecipePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { PlannerPage } from './pages/PlannerPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { PricesPage } from './pages/PricesPage';
import { BillingPage } from './pages/BillingPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProfilePage } from './pages/ProfilePage';

function NavBar() {
  const { token, isAdmin, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">Latvian Recipes</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link to="/recipes" className="hover:underline">Browse</Link>
            <Link to="/challenges" className="hover:underline">Challenges</Link>
            <Link to="/prices" className="hover:underline">Prices</Link>
            <Link to="/billing" className="hover:underline">Premium</Link>
            {token && (
              <>
                <Link to="/submit" className="hover:underline">Submit</Link>
                <Link to="/planner" className="hover:underline">Planner</Link>
                <Link to="/profile" className="hover:underline">Profile</Link>
                <Link to="/recommendations" className="hover:underline">For you</Link>
              </>
            )}
            {isAdmin && (
              <a href={`http://${window.location.hostname}:5173/`} className="hover:underline" target="_blank" rel="noreferrer">Admin</a>
            )}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <button onClick={logout} className="px-3 py-1 rounded bg-gray-900 text-white text-sm">Logout</button>
          ) : (
            <>
              <Link to="/login" className="hover:underline text-sm">Login</Link>
              <Link to="/register" className="hover:underline text-sm">Sign up</Link>
            </>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <nav className="px-4 py-3 flex flex-col gap-3 text-sm">
            <Link to="/recipes" onClick={() => setOpen(false)}>Browse</Link>
            <Link to="/challenges" onClick={() => setOpen(false)}>Challenges</Link>
            <Link to="/prices" onClick={() => setOpen(false)}>Prices</Link>
            <Link to="/billing" onClick={() => setOpen(false)}>Premium</Link>
            {token && (
              <>
                <Link to="/submit" onClick={() => setOpen(false)}>Submit</Link>
                <Link to="/planner" onClick={() => setOpen(false)}>Planner</Link>
                <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <Link to="/recommendations" onClick={() => setOpen(false)}>For you</Link>
              </>
            )}
            {isAdmin && (
              <a href={`http://${window.location.hostname}:5173/`} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Admin</a>
            )}
            {token ? (
              <button onClick={() => { setOpen(false); logout(); }} className="text-left">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </nav>
        </div>
      )}
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
            <Route path="/submit" element={<SubmitRecipePage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};