import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AuthProvider } from './auth/AuthContext';
import { SubmitRecipePage } from './pages/SubmitRecipePage';
import { PreferencesPage } from './pages/PreferencesPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { PricesPage } from './pages/PricesPage';
import { BillingPage } from './pages/BillingPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProfilePage } from './pages/ProfilePage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

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
                <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
                <Route path="/recipes" element={<ErrorBoundary><RecipesPage /></ErrorBoundary>} />
                <Route path="/recipes/:id" element={<ErrorBoundary><RecipeDetailPage /></ErrorBoundary>} />
                <Route path="/favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
                <Route path="/submit" element={<ErrorBoundary><SubmitRecipePage /></ErrorBoundary>} />
                <Route path="/preferences" element={<ErrorBoundary><PreferencesPage /></ErrorBoundary>} />
                <Route path="/recommendations" element={<ErrorBoundary><RecommendationsPage /></ErrorBoundary>} />
                <Route path="/prices" element={<ErrorBoundary><PricesPage /></ErrorBoundary>} />
                <Route path="/billing" element={<ErrorBoundary><BillingPage /></ErrorBoundary>} />
                <Route path="/challenges" element={<ErrorBoundary><ChallengesPage /></ErrorBoundary>} />
                <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
                <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
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