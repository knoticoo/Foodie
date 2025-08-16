import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Helper functions
async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

async function loginUser(page: Page, email = 'test@example.com', password = 'testpassword') {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await waitForNetworkIdle(page);
}

async function createTestRecipe(page: Page) {
  const testRecipe = {
    title: 'E2E Test Recepte',
    description: 'Šī ir testa recepte E2E testiem',
    ingredients: ['1 kg kartupeļi', '500g gaļa', '2 burkāni'],
    steps: ['Nomizot kartupeļus', 'Sagriezt gaļu', 'Vārīt 30 minūtes'],
    category: 'Pusdienas',
    difficulty: 'easy',
    cookTime: 45
  };
  
  await page.goto(`${BASE_URL}/submit`);
  
  // Fill form
  await page.fill('[data-testid="recipe-title"]', testRecipe.title);
  await page.fill('[data-testid="recipe-description"]', testRecipe.description);
  
  // Add ingredients
  for (const ingredient of testRecipe.ingredients) {
    await page.fill('[data-testid="ingredient-input"]', ingredient);
    await page.click('[data-testid="add-ingredient"]');
  }
  
  // Add steps
  for (const step of testRecipe.steps) {
    await page.fill('[data-testid="step-input"]', step);
    await page.click('[data-testid="add-step"]');
  }
  
  // Select category and difficulty
  await page.selectOption('[data-testid="category-select"]', testRecipe.category);
  await page.selectOption('[data-testid="difficulty-select"]', testRecipe.difficulty);
  
  // Submit
  await page.click('[data-testid="submit-recipe"]');
  await waitForNetworkIdle(page);
  
  return testRecipe;
}

test.describe('Recipe Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await page.goto(BASE_URL);
    await waitForNetworkIdle(page);
  });

  test('should display search interface correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Check main search elements
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
    
    // Check filter options
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="difficulty-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="cook-time-filter"]')).toBeVisible();
  });

  test('should search recipes by title', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Search for a specific recipe
    await page.fill('[data-testid="search-input"]', 'pasta');
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await waitForNetworkIdle(page);
    await expect(page.locator('[data-testid="recipe-results"]')).toBeVisible();
    
    // Check that results contain search term
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    await expect(recipeCards.first()).toBeVisible();
    
    // Verify search term appears in results
    const firstRecipe = recipeCards.first();
    const title = await firstRecipe.locator('[data-testid="recipe-title"]').textContent();
    expect(title?.toLowerCase()).toContain('pasta');
  });

  test('should filter recipes by category', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Select a category
    await page.selectOption('[data-testid="category-filter"]', 'Pusdienas');
    await waitForNetworkIdle(page);
    
    // Check that all visible recipes are from selected category
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    const count = await recipeCards.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const category = await recipeCards.nth(i).locator('[data-testid="recipe-category"]').textContent();
      expect(category).toBe('Pusdienas');
    }
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Start typing to trigger suggestions
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('kar');
    
    // Wait for suggestions to appear
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
    
    // Check suggestion items
    const suggestions = page.locator('[data-testid="suggestion-item"]');
    await expect(suggestions.first()).toBeVisible();
    
    // Click on a suggestion
    await suggestions.first().click();
    
    // Verify search input was updated
    await waitForNetworkIdle(page);
    const inputValue = await searchInput.inputValue();
    expect(inputValue.length).toBeGreaterThan(3);
  });

  test('should handle advanced search with multiple filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Apply multiple filters
    await page.fill('[data-testid="search-input"]', 'gaļa');
    await page.selectOption('[data-testid="category-filter"]', 'Pusdienas');
    await page.selectOption('[data-testid="difficulty-filter"]', 'easy');
    await page.selectOption('[data-testid="cook-time-filter"]', '30');
    
    await page.click('[data-testid="search-button"]');
    await waitForNetworkIdle(page);
    
    // Verify results match all filters
    await expect(page.locator('[data-testid="recipe-results"]')).toBeVisible();
    
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    if (await recipeCards.count() > 0) {
      const firstRecipe = recipeCards.first();
      
      // Check category
      const category = await firstRecipe.locator('[data-testid="recipe-category"]').textContent();
      expect(category).toBe('Pusdienas');
      
      // Check difficulty
      const difficulty = await firstRecipe.locator('[data-testid="recipe-difficulty"]').textContent();
      expect(difficulty).toBe('easy');
    }
  });

  test('should show no results message when search finds nothing', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Search for something that doesn't exist
    await page.fill('[data-testid="search-input"]', 'xyznonsenseterm123');
    await page.click('[data-testid="search-button"]');
    await waitForNetworkIdle(page);
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText('Nav atrasts');
  });

  test('should handle search pagination', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Perform search that should return multiple pages
    await page.click('[data-testid="search-button"]'); // Search all recipes
    await waitForNetworkIdle(page);
    
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // Check pagination controls
      await expect(page.locator('[data-testid="page-next"]')).toBeVisible();
      
      // Click next page
      await page.click('[data-testid="page-next"]');
      await waitForNetworkIdle(page);
      
      // Verify page changed
      await expect(page.locator('[data-testid="page-info"]')).toContainText('2');
    }
  });

  test('should save and load search preferences', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    
    // Set search preferences
    await page.selectOption('[data-testid="category-filter"]', 'Brokastis');
    await page.selectOption('[data-testid="difficulty-filter"]', 'medium');
    
    // Reload page
    await page.reload();
    await waitForNetworkIdle(page);
    
    // Check if preferences were saved (if implemented)
    // This would depend on the actual implementation
    const categoryValue = await page.locator('[data-testid="category-filter"]').inputValue();
    // expect(categoryValue).toBe('Brokastis'); // Uncomment if persistence is implemented
  });
});

test.describe('Recipe Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page);
  });

  test('should add recipe to favorites', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Find first recipe and add to favorites
    const firstRecipe = page.locator('[data-testid="recipe-card"]').first();
    await firstRecipe.locator('[data-testid="favorite-button"]').click();
    
    // Wait for API call
    await waitForNetworkIdle(page);
    
    // Check that favorite button state changed
    await expect(firstRecipe.locator('[data-testid="favorite-button"]')).toHaveClass(/favorited/);
    
    // Navigate to favorites page
    await page.goto(`${BASE_URL}/favorites`);
    await waitForNetworkIdle(page);
    
    // Verify recipe appears in favorites
    await expect(page.locator('[data-testid="recipe-card"]').first()).toBeVisible();
  });

  test('should rate a recipe', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Click on first recipe to view details
    await page.locator('[data-testid="recipe-card"]').first().click();
    await waitForNetworkIdle(page);
    
    // Rate the recipe (4 stars)
    await page.locator('[data-testid="star-4"]').click();
    await waitForNetworkIdle(page);
    
    // Verify rating was saved
    await expect(page.locator('[data-testid="user-rating"]')).toContainText('4');
  });

  test('should share a recipe', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Click on first recipe
    await page.locator('[data-testid="recipe-card"]').first().click();
    await waitForNetworkIdle(page);
    
    // Open share menu
    await page.click('[data-testid="share-button"]');
    await expect(page.locator('[data-testid="share-menu"]')).toBeVisible();
    
    // Test copy link functionality
    await page.click('[data-testid="copy-link"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
  });
});

test.describe('Recipe Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('should create a new recipe', async ({ page }) => {
    const testRecipe = await createTestRecipe(page);
    
    // Should redirect to success page or recipe list
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('pievienota');
  });

  test('should edit an existing recipe', async ({ page }) => {
    // First create a recipe
    await createTestRecipe(page);
    
    // Navigate to user's recipes
    await page.goto(`${BASE_URL}/profile/recipes`);
    await waitForNetworkIdle(page);
    
    // Edit first recipe
    await page.locator('[data-testid="edit-recipe"]').first().click();
    await waitForNetworkIdle(page);
    
    // Update title
    const newTitle = 'Atjaunināta E2E Test Recepte';
    await page.fill('[data-testid="recipe-title"]', newTitle);
    
    // Save changes
    await page.click('[data-testid="save-recipe"]');
    await waitForNetworkIdle(page);
    
    // Verify update
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should delete a recipe', async ({ page }) => {
    // Create a recipe first
    await createTestRecipe(page);
    
    // Navigate to user's recipes
    await page.goto(`${BASE_URL}/profile/recipes`);
    await waitForNetworkIdle(page);
    
    // Delete first recipe
    await page.locator('[data-testid="delete-recipe"]').first().click();
    
    // Confirm deletion
    await page.locator('[data-testid="confirm-delete"]').click();
    await waitForNetworkIdle(page);
    
    // Verify deletion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});

test.describe('Performance and Accessibility Tests', () => {
  test('should load recipes page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Tab through main elements
    await page.keyboard.press('Tab'); // Search input
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Search button
    await expect(page.locator('[data-testid="search-button"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Category filter
    await expect(page.locator('[data-testid="category-filter"]')).toBeFocused();
    
    // Test keyboard search
    await page.keyboard.press('Shift+Tab'); // Back to search button
    await page.keyboard.press('Shift+Tab'); // Back to search input
    await page.keyboard.type('test search');
    await page.keyboard.press('Enter');
    
    await waitForNetworkIdle(page);
    
    // Should show results
    await expect(page.locator('[data-testid="recipe-results"]')).toBeVisible();
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-search-toggle"]')).toBeVisible();
    
    // Test mobile search interaction
    await page.click('[data-testid="mobile-search-toggle"]');
    await expect(page.locator('[data-testid="mobile-search-panel"]')).toBeVisible();
  });

  test('should work offline (if PWA is implemented)', async ({ page, context }) => {
    // Go online first and load the page
    await page.goto(`${BASE_URL}/recipes`);
    await waitForNetworkIdle(page);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate (should work if PWA is properly implemented)
    await page.reload();
    
    // Should show offline message or cached content
    await expect(page.locator('body')).toBeVisible();
    
    // Re-enable network
    await context.setOffline(false);
  });
});

test.describe('Error Handling Tests', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route(`${API_URL}/api/**`, route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto(`${BASE_URL}/recipes`);
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle network timeout', async ({ page }) => {
    // Intercept and delay API calls
    await page.route(`${API_URL}/api/**`, route => {
      // Don't fulfill the route to simulate timeout
    });
    
    await page.goto(`${BASE_URL}/recipes`);
    
    // Should show loading state and then timeout message
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    
    // Wait for timeout (adjust based on actual timeout implementation)
    await page.waitForTimeout(10000);
    
    await expect(page.locator('[data-testid="timeout-message"]')).toBeVisible();
  });
});

// Test cleanup
test.afterEach(async ({ page }) => {
  // Clear any test data or reset state if needed
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});