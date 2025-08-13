import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const ADMIN_WEB_URL = (import.meta as any).env?.VITE_ADMIN_WEB_URL || (window as any).__VITE__?.VITE_ADMIN_WEB_URL || `http://${window.location.hostname}:5173/`;

export const Header: React.FC = () => {
  const { token, isAdmin, isPremium, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setDiscoverOpen(false);
        setAccountOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false);
        setAccountOpen(false);
      }
    }
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div ref={containerRef} className="container h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold tracking-tight text-slate-900">Latvian Recipes</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm relative">
            <Link to="/recipes" className="hover:text-slate-900 text-slate-600 transition-colors">Browse</Link>
            <div className="relative" onMouseLeave={() => setDiscoverOpen(false)}>
              <button className="hover:text-slate-900 text-slate-600 transition-colors inline-flex items-center gap-1" onClick={() => setDiscoverOpen(v => !v)} aria-expanded={discoverOpen} aria-haspopup="true">
                Discover
                <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${discoverOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              {discoverOpen && (
                <div className="absolute z-20 mt-2 bg-white border rounded-xl shadow-lg p-2 min-w-[180px] animate-scaleIn">
                  <Link to="/challenges" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setDiscoverOpen(false)}>Challenges</Link>
                  <Link to="/prices" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setDiscoverOpen(false)}>Prices</Link>
                </div>
              )}
            </div>
            <Link to="/billing" className="hover:text-slate-900 text-slate-600 transition-colors">Premium{isPremium ? ' ✓' : ''}</Link>
            {isAdmin && (
              <a href={`${ADMIN_WEB_URL}${token ? `?token=${encodeURIComponent(token)}` : ''}`} className="hover:text-slate-900 text-slate-600 transition-colors" target="_blank" rel="noreferrer">Admin</a>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3 relative">
          {token ? (
            <div className="relative" onMouseLeave={() => setAccountOpen(false)}>
              <button className="btn btn-secondary" onClick={() => setAccountOpen(v => !v)} aria-expanded={accountOpen} aria-haspopup="true">
                Account
                <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              {accountOpen && (
                <div className="absolute right-0 z-20 mt-2 bg-white border rounded-xl shadow-lg p-2 min-w-[200px] animate-scaleIn">
                  <Link to="/profile" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setAccountOpen(false)}>Profile</Link>
                  <Link to="/planner" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setAccountOpen(false)}>Planner</Link>
                  <Link to="/recommendations" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setAccountOpen(false)}>For you</Link>
                  <Link to="/submit" className="block px-3 py-2 rounded hover:bg-slate-50" onClick={() => setAccountOpen(false)}>Submit</Link>
                  <button className="block w-full text-left px-3 py-2 rounded hover:bg-slate-50" onClick={() => { setAccountOpen(false); logout(); }}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded hover:bg-slate-100" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
          <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t animate-fadeIn">
          <nav className="container py-4 flex flex-col gap-3 text-sm">
            <Link to="/recipes" onClick={() => setMobileOpen(false)} className="px-2 py-2 rounded hover:bg-slate-50">Browse</Link>
            <div className="border rounded-xl">
              <div className="px-3 py-2 font-medium">Discover</div>
              <Link to="/challenges" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50 rounded-b-xl">Challenges</Link>
              <Link to="/prices" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50">Prices</Link>
            </div>
            <Link to="/billing" onClick={() => setMobileOpen(false)} className="px-2 py-2 rounded hover:bg-slate-50">Premium{isPremium ? ' ✓' : ''}</Link>
            {token && (
              <div className="border rounded-xl">
                <div className="px-3 py-2 font-medium">Account</div>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50">Profile</Link>
                <Link to="/planner" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50">Planner</Link>
                <Link to="/recommendations" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50">For you</Link>
                <Link to="/submit" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-slate-50">Submit</Link>
                <button onClick={() => { setMobileOpen(false); logout(); }} className="text-left px-3 py-2 hover:bg-slate-50">Logout</button>
              </div>
            )}
            {isAdmin && (
              <a href={`${ADMIN_WEB_URL}${token ? `?token=${encodeURIComponent(token)}` : ''}`} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)} className="px-2 py-2 rounded hover:bg-slate-50">Admin</a>
            )}
            {!token && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost flex-1">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary flex-1">Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};