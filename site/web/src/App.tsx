import React, { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LazyRoute } from './components/LazyRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const RecipesPage = lazy(() => import('./pages/RecipesPage').then(m => ({ default: m.RecipesPage })));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage').then(m => ({ default: m.RecipeDetailPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const SubmitRecipePage = lazy(() => import('./pages/SubmitRecipePage').then(m => ({ default: m.SubmitRecipePage })));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage').then(m => ({ default: m.PreferencesPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const PricesPage = lazy(() => import('./pages/PricesPage').then(m => ({ default: m.PricesPage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then(m => ({ default: m.ChallengesPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <ErrorBoundary fallback={<div className="p-4 text-center text-red-600">Header sabruka</div>}>
              <Header />
            </ErrorBoundary>
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LazyRoute loadingVariant="skeleton"><HomePage /></LazyRoute>} />
                <Route path="/login" element={<LazyRoute loadingVariant="spinner"><LoginPage /></LazyRoute>} />
                <Route path="/register" element={<LazyRoute loadingVariant="spinner"><RegisterPage /></LazyRoute>} />
                <Route path="/recipes" element={<LazyRoute loadingVariant="skeleton"><RecipesPage /></LazyRoute>} />
                <Route path="/recipes/:id" element={<LazyRoute loadingVariant="skeleton"><RecipeDetailPage /></LazyRoute>} />
                <Route path="/favorites" element={<LazyRoute loadingVariant="skeleton"><FavoritesPage /></LazyRoute>} />
                <Route path="/submit" element={<LazyRoute loadingVariant="full"><SubmitRecipePage /></LazyRoute>} />
                <Route path="/preferences" element={<LazyRoute loadingVariant="spinner"><PreferencesPage /></LazyRoute>} />
                <Route path="/recommendations" element={<LazyRoute loadingVariant="skeleton"><RecommendationsPage /></LazyRoute>} />
                <Route path="/prices" element={<LazyRoute loadingVariant="skeleton"><PricesPage /></LazyRoute>} />
                <Route path="/billing" element={<LazyRoute loadingVariant="spinner"><BillingPage /></LazyRoute>} />
                <Route path="/challenges" element={<LazyRoute loadingVariant="skeleton"><ChallengesPage /></LazyRoute>} />
                <Route path="/profile" element={<LazyRoute loadingVariant="spinner"><ProfilePage /></LazyRoute>} />
                <Route path="*" element={<LazyRoute loadingVariant="full"><NotFoundPage /></LazyRoute>} />
              </Routes>
            </main>
            <ErrorBoundary fallback={<div className="p-4 text-center text-gray-600">Footer sabruka</div>}>
              <Footer />
            </ErrorBoundary>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};