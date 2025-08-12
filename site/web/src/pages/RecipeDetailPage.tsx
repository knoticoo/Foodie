import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:3000`
  : 'http://127.0.0.1:3000';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? defaultApiBase;

type Recipe = { id: string; title: string; description?: string; ingredients?: any[] };

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/recipes/${id}`).then(r => r.json()).then(setRecipe).catch(() => setRecipe(null));
  }, [id]);

  if (!recipe) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{recipe.title}</h1>
      {recipe.description && <p className="text-gray-700">{recipe.description}</p>}
      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Ingredients</h2>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {recipe.ingredients.map((it: any, idx: number) => (
              <li key={idx}>{it.name ?? it.ingredient ?? 'Item'} — {it.quantity ?? it.amount ?? ''} {it.unit ?? ''}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};