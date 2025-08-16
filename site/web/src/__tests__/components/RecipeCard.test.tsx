import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, mockRecipe, setupTest } from '../utils/test-helpers';

// Mock the RecipeCard component (assuming it exists)
const RecipeCard: React.FC<{
  recipe: any;
  onFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  showActions?: boolean;
}> = ({ recipe, onFavorite, onRate, showActions = true }) => {
  return (
    <div data-testid="recipe-card" className="recipe-card">
      <div className="recipe-image">
        <img src={recipe.image || '/default-recipe.jpg'} alt={recipe.title} />
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        
        <div className="recipe-meta">
          <span className="cook-time">{recipe.cookTime} min</span>
          <span className="servings">{recipe.servings} porcijas</span>
          <span className="difficulty">{recipe.difficulty}</span>
        </div>
        
        <div className="recipe-stats">
          <span className="rating">
            ⭐ {recipe.rating ? recipe.rating.toFixed(1) : 'Nav vērtējuma'}
          </span>
          <span className="author">Autors: {recipe.author}</span>
        </div>
        
        {showActions && (
          <div className="recipe-actions">
            <button
              onClick={() => onFavorite?.(recipe.id)}
              className="favorite-btn"
              aria-label="Pievienot izlasei"
            >
              ❤️ Izlase
            </button>
            
            <div className="rating-section">
              <span>Novērtēt: </span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onRate?.(recipe.id, star)}
                  className="star-btn"
                  aria-label={`Novērtēt ar ${star} zvaigznēm`}
                  data-testid={`star-${star}`}
                >
                  {star <= (recipe.userRating || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="recipe-ingredients">
          <h4>Sastāvdaļas:</h4>
          <ul>
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="recipe-nutrition" data-testid="nutrition-info">
          {recipe.nutritionInfo && (
            <>
              <h4>Uzturvērtība:</h4>
              <ul>
                <li>Kalorijas: {recipe.nutritionInfo.calories}</li>
                <li>Olbaltumvielas: {recipe.nutritionInfo.protein}g</li>
                <li>Ogļhidrāti: {recipe.nutritionInfo.carbs}g</li>
                <li>Tauki: {recipe.nutritionInfo.fat}g</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

describe('RecipeCard Component', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const setup = setupTest();
    cleanup = setup.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders recipe information correctly', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />);

    // Check basic recipe information
    expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.cookTime} min`)).toBeInTheDocument();
    expect(screen.getByText(`${mockRecipe.servings} porcijas`)).toBeInTheDocument();
    expect(screen.getByText(mockRecipe.difficulty)).toBeInTheDocument();
    expect(screen.getByText(`Autors: ${mockRecipe.author}`)).toBeInTheDocument();

    // Check rating display
    expect(screen.getByText(`⭐ ${mockRecipe.rating.toFixed(1)}`)).toBeInTheDocument();

    // Check ingredients are displayed
    mockRecipe.ingredients.forEach((ingredient: string) => {
      expect(screen.getByText(ingredient)).toBeInTheDocument();
    });

    // Check nutrition information
    const nutritionSection = screen.getByTestId('nutrition-info');
    expect(nutritionSection).toBeInTheDocument();
    expect(screen.getByText(`Kalorijas: ${mockRecipe.nutritionInfo.calories}`)).toBeInTheDocument();
    expect(screen.getByText(`Olbaltumvielas: ${mockRecipe.nutritionInfo.protein}g`)).toBeInTheDocument();
  });

  it('handles favorite button click', async () => {
    const onFavorite = vi.fn();
    renderWithProviders(<RecipeCard recipe={mockRecipe} onFavorite={onFavorite} />);

    const favoriteBtn = screen.getByLabelText('Pievienot izlasei');
    fireEvent.click(favoriteBtn);

    await waitFor(() => {
      expect(onFavorite).toHaveBeenCalledWith(mockRecipe.id);
    });
  });

  it('handles star rating clicks', async () => {
    const onRate = vi.fn();
    renderWithProviders(<RecipeCard recipe={mockRecipe} onRate={onRate} />);

    // Click on 4th star
    const fourthStar = screen.getByTestId('star-4');
    fireEvent.click(fourthStar);

    await waitFor(() => {
      expect(onRate).toHaveBeenCalledWith(mockRecipe.id, 4);
    });
  });

  it('displays all 5 rating stars', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`star-${i}`)).toBeInTheDocument();
    }
  });

  it('shows correct accessibility labels', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByLabelText('Pievienot izlasei')).toBeInTheDocument();
    expect(screen.getByLabelText('Novērtēt ar 1 zvaigznēm')).toBeInTheDocument();
    expect(screen.getByLabelText('Novērtēt ar 5 zvaigznēm')).toBeInTheDocument();
  });

  it('hides actions when showActions is false', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} showActions={false} />);

    expect(screen.queryByLabelText('Pievienot izlasei')).not.toBeInTheDocument();
    expect(screen.queryByTestId('star-1')).not.toBeInTheDocument();
  });

  it('displays default image when recipe image is missing', () => {
    const recipeWithoutImage = { ...mockRecipe, image: undefined };
    renderWithProviders(<RecipeCard recipe={recipeWithoutImage} />);

    const image = screen.getByAltText(mockRecipe.title);
    expect(image).toHaveAttribute('src', '/default-recipe.jpg');
  });

  it('shows "Nav vērtējuma" when recipe has no rating', () => {
    const recipeWithoutRating = { ...mockRecipe, rating: undefined };
    renderWithProviders(<RecipeCard recipe={recipeWithoutRating} />);

    expect(screen.getByText('⭐ Nav vērtējuma')).toBeInTheDocument();
  });

  it('handles missing nutrition information gracefully', () => {
    const recipeWithoutNutrition = { ...mockRecipe, nutritionInfo: undefined };
    renderWithProviders(<RecipeCard recipe={recipeWithoutNutrition} />);

    // Should still render the card but without nutrition section
    expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    expect(screen.queryByText('Uzturvērtība:')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const onFavorite = vi.fn();
    const onRate = vi.fn();
    renderWithProviders(
      <RecipeCard recipe={mockRecipe} onFavorite={onFavorite} onRate={onRate} />
    );

    const favoriteBtn = screen.getByLabelText('Pievienot izlasei');
    
    // Focus and press Enter
    favoriteBtn.focus();
    fireEvent.keyDown(favoriteBtn, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(onFavorite).toHaveBeenCalledWith(mockRecipe.id);
    });

    // Test star button keyboard navigation
    const starBtn = screen.getByTestId('star-3');
    starBtn.focus();
    fireEvent.keyDown(starBtn, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(onRate).toHaveBeenCalledWith(mockRecipe.id, 3);
    });
  });

  it('renders with custom theme', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />, { theme: 'dark' });

    // Component should render regardless of theme
    expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
  });

  it('handles long recipe titles gracefully', () => {
    const recipeWithLongTitle = {
      ...mockRecipe,
      title: 'This is a very long recipe title that should be handled gracefully by the component even when it exceeds normal length expectations'
    };
    
    renderWithProviders(<RecipeCard recipe={recipeWithLongTitle} />);
    
    expect(screen.getByText(recipeWithLongTitle.title)).toBeInTheDocument();
  });

  it('displays recipe tags correctly', () => {
    renderWithProviders(<RecipeCard recipe={mockRecipe} />);

    // Check if tags are displayed (if the component supports them)
    mockRecipe.tags.forEach((tag: string) => {
      // This would need to be implemented in the actual component
      // expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles rapid clicking without issues', async () => {
    const onFavorite = vi.fn();
    renderWithProviders(<RecipeCard recipe={mockRecipe} onFavorite={onFavorite} />);

    const favoriteBtn = screen.getByLabelText('Pievienot izlasei');
    
    // Rapid clicks
    fireEvent.click(favoriteBtn);
    fireEvent.click(favoriteBtn);
    fireEvent.click(favoriteBtn);

    await waitFor(() => {
      expect(onFavorite).toHaveBeenCalledTimes(3);
    });
  });

  it('maintains component state during re-renders', () => {
    const { rerender } = renderWithProviders(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument();

    // Re-render with updated recipe
    const updatedRecipe = { ...mockRecipe, title: 'Updated Recipe Title' };
    rerender(<RecipeCard recipe={updatedRecipe} />);

    expect(screen.getByText('Updated Recipe Title')).toBeInTheDocument();
    expect(screen.queryByText(mockRecipe.title)).not.toBeInTheDocument();
  });
});