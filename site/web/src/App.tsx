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
import { PlannerPage } from './pages/PlannerPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { PricesPage } from './pages/PricesPage';
import { BillingPage } from './pages/BillingPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProfilePage } from './pages/ProfilePage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="container py-6">
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
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
};