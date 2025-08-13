import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="container py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold mb-2">Latvian Recipes</div>
          <p className="text-slate-600">Seasonal, affordable, and delicious recipes curated for everyday cooking.</p>
        </div>
        <div>
          <div className="font-medium mb-2">Explore</div>
          <ul className="space-y-2 text-slate-700">
            <li><Link to="/recipes" className="hover:underline">Browse recipes</Link></li>
            <li><Link to="/prices" className="hover:underline">Prices</Link></li>
            <li><Link to="/challenges" className="hover:underline">Challenges</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Account</div>
          <ul className="space-y-2 text-slate-700">
            <li><Link to="/login" className="hover:underline">Login</Link></li>
            <li><Link to="/register" className="hover:underline">Sign up</Link></li>
            <li><Link to="/billing" className="hover:underline">Premium</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Follow</div>
          <div className="flex gap-3 text-slate-600">
            <a href="#" aria-label="Twitter" className="hover:text-slate-900">𝕏</a>
            <a href="#" aria-label="Instagram" className="hover:text-slate-900">IG</a>
            <a href="#" aria-label="YouTube" className="hover:text-slate-900">YT</a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Latvian Recipes</div>
          <div className="flex gap-3">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};