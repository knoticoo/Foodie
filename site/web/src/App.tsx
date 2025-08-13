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

// Configurable admin web URL (fallback: host:5173)
const ADMIN_WEB_URL = (import.meta as any).env?.VITE_ADMIN_WEB_URL || (window as any).__VITE__?.VITE_ADMIN_WEB_URL || `http://${window.location.hostname}:5173/`;

function NavBar() {
  const { token, isAdmin, isPremium, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [openDiscover, setOpenDiscover] = React.useState(false);
  const [openUser, setOpenUser] = React.useState(false);
  return (
    <header className="bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">Latvian Recipes</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm relative">
            <Link to="/recipes" className="hover:underline">Browse</Link>
            <div className="relative" onMouseLeave={() => setOpenDiscover(false)}>
              <button className="hover:underline" onClick={() => setOpenDiscover(v => !v)}>Discover ▾</button>
              {openDiscover && (
                <div className="absolute z-20 mt-2 bg-white border rounded shadow-md p-2 min-w-[160px] animate-scaleIn">
                  <Link to="/challenges" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenDiscover(false)}>Challenges</Link>
                  <Link to="/prices" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenDiscover(false)}>Prices</Link>
                </div>
              )}
            </div>
            <Link to="/billing" className="hover:underline">Premium{isPremium ? ' ✓' : ''}</Link>
            {isAdmin && (
              <a href={ADMIN_WEB_URL} className="hover:underline" target="_blank" rel="noreferrer">Admin</a>
            )}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-3 relative">
          {token ? (
            <div className="relative" onMouseLeave={() => setOpenUser(false)}>
              <button className="px-3 py-1 rounded border" onClick={() => setOpenUser(v => !v)}>Account ▾</button>
              {openUser && (
                <div className="absolute right-0 z-20 mt-2 bg-white border rounded shadow-md p-2 min-w-[180px] animate-scaleIn">
                  <Link to="/profile" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenUser(false)}>Profile</Link>
                  <Link to="/planner" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenUser(false)}>Planner</Link>
                  <Link to="/recommendations" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenUser(false)}>For you</Link>
                  <Link to="/submit" className="block px-3 py-1 hover:bg-gray-50" onClick={() => setOpenUser(false)}>Submit</Link>
                  <button className="block w-full text-left px-3 py-1 hover:bg-gray-50" onClick={() => { setOpenUser(false); logout(); }}>Logout</button>
                </div>
              )}
            </div>
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
        <div className="md:hidden border-t animate-fadeIn">
          <nav className="px-4 py-3 flex flex-col gap-3 text-sm">
            <Link to="/recipes" onClick={() => setOpen(false)}>Browse</Link>
            <div className="border rounded">
              <div className="px-3 py-2 font-medium">Discover</div>
              <Link to="/challenges" onClick={() => setOpen(false)} className="block px-3 py-1">Challenges</Link>
              <Link to="/prices" onClick={() => setOpen(false)} className="block px-3 py-1">Prices</Link>
            </div>
            <Link to="/billing" onClick={() => setOpen(false)}>Premium{isPremium ? ' ✓' : ''}</Link>
            {token && (
              <div className="border rounded">
                <div className="px-3 py-2 font-medium">Account</div>
                <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-1">Profile</Link>
                <Link to="/planner" onClick={() => setOpen(false)} className="block px-3 py-1">Planner</Link>
                <Link to="/recommendations" onClick={() => setOpen(false)} className="block px-3 py-1">For you</Link>
                <Link to="/submit" onClick={() => setOpen(false)} className="block px-3 py-1">Submit</Link>
                <button onClick={() => { setOpen(false); logout(); }} className="text-left px-3 py-1">Logout</button>
              </div>
            )}
            {isAdmin && (
              <a href={ADMIN_WEB_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Admin</a>
            )}
            {!token && (
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