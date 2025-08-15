import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { AuthProvider } from '../../auth/AuthContext';
import { ThemeProvider } from '../../hooks/useTheme';
import { PerformanceProvider } from '../../utils/performance';
import { KeyboardShortcutsProvider } from '../../hooks/useKeyboardShortcuts';

// Mock data generators
export const mockRecipe = {
  id: '1',
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  image: '/images/test-recipe.jpg',
  cookTime: 30,
  servings: 4,
  rating: 4.5,
  ingredients: ['Test ingredient 1', 'Test ingredient 2'],
  instructions: ['Step 1', 'Step 2'],
  author: 'Test Chef',
  category: 'Test Category',
  difficulty: 'easy' as const,
  nutritionInfo: {
    calories: 250,
    protein: 15,
    carbs: 30,
    fat: 8
  },
  tags: ['healthy', 'quick'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: '/images/test-avatar.jpg',
  isAdmin: false,
  isPremium: false,
  preferences: {
    theme: 'light' as const,
    language: 'lv' as const,
    notifications: true
  },
  createdAt: '2024-01-01T00:00:00Z'
};

export const mockComment = {
  id: '1',
  recipeId: '1',
  userId: '1',
  user: mockUser,
  content: 'Great recipe!',
  rating: 5,
  isApproved: true,
  createdAt: '2024-01-01T00:00:00Z'
};

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  theme?: 'light' | 'dark' | 'system';
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    theme = 'light',
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme={theme}>
            <PerformanceProvider>
              <KeyboardShortcutsProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </KeyboardShortcutsProvider>
            </PerformanceProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Create test query client
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

// Mock API responses
export const mockApiResponses = {
  recipes: {
    list: {
      data: [mockRecipe],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1
    },
    detail: mockRecipe,
    search: {
      data: [mockRecipe],
      suggestions: [
        { id: '1', type: 'recipe' as const, text: 'Test Recipe' },
        { id: '2', type: 'ingredient' as const, text: 'Test Ingredient' }
      ],
      total: 1
    }
  },
  auth: {
    login: {
      user: mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    },
    register: {
      user: mockUser,
      token: 'mock-jwt-token'
    },
    profile: mockUser
  },
  comments: {
    list: [mockComment],
    create: mockComment
  }
};

// Mock fetch responses
export function mockFetch(responses: Record<string, any>) {
  const mockFn = vi.fn();
  
  Object.entries(responses).forEach(([url, response]) => {
    mockFn.mockImplementationOnce((fetchUrl: string) => {
      if (fetchUrl.includes(url)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
          text: () => Promise.resolve(JSON.stringify(response)),
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.reject(new Error(`Mock not found for ${fetchUrl}`));
    });
  });

  global.fetch = mockFn;
  return mockFn;
}

// Mock localStorage
export function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn()
  };
}

// Mock intersection observer
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
}

// Mock resize observer
export function mockResizeObserver() {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
}

// Mock matchMedia
export function mockMatchMedia(matches = false) {
  const mockMatchMedia = vi.fn();
  mockMatchMedia.mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  
  window.matchMedia = mockMatchMedia;
  return mockMatchMedia;
}

// Mock clipboard API
export function mockClipboard() {
  const mockClipboard = {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('mock text')),
  };
  
  Object.assign(navigator, { clipboard: mockClipboard });
  return mockClipboard;
}

// Mock navigator share
export function mockNavigatorShare() {
  const mockShare = vi.fn(() => Promise.resolve());
  Object.assign(navigator, { share: mockShare });
  return mockShare;
}

// Test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function createMockEvent(type: string, properties: Record<string, any> = {}) {
  const event = new Event(type);
  Object.assign(event, properties);
  return event;
}

export function createMockFormData(data: Record<string, any>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received: HTMLElement) => {
    return {
      pass: document.body.contains(received),
      message: () => `Expected element to be in the document`
    };
  },
  
  toHaveAccessibleName: (received: HTMLElement, expectedName: string) => {
    const accessibleName = received.getAttribute('aria-label') || 
                          received.getAttribute('aria-labelledby') ||
                          received.textContent;
    
    return {
      pass: accessibleName === expectedName,
      message: () => `Expected accessible name "${expectedName}", got "${accessibleName}"`
    };
  }
};

// Setup function for tests
export function setupTest() {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Mock browser APIs
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia();
  mockClipboard();
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true
  });
  
  // Mock scrollTo
  window.scrollTo = vi.fn();
  
  // Mock requestAnimationFrame
  window.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
  window.cancelAnimationFrame = vi.fn();
  
  // Mock console methods to reduce noise in tests
  const originalError = console.error;
  console.error = vi.fn((...args) => {
    // Only show actual errors, not React warnings
    if (args[0]?.includes && !args[0].includes('Warning:')) {
      originalError(...args);
    }
  });
  
  return {
    cleanup: () => {
      vi.clearAllMocks();
      console.error = originalError;
    }
  };
}

// Database test helpers
export const dbTestHelpers = {
  async createTestUser(overrides = {}) {
    return { ...mockUser, ...overrides };
  },
  
  async createTestRecipe(overrides = {}) {
    return { ...mockRecipe, ...overrides };
  },
  
  async createTestComment(overrides = {}) {
    return { ...mockComment, ...overrides };
  },
  
  async cleanupTestData() {
    // In real tests, this would clean up test database
    return Promise.resolve();
  }
};

// Performance test helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    await waitFor(0); // Wait for render
    const end = performance.now();
    return end - start;
  },
  
  measureAsyncOperation: async (operation: () => Promise<any>) => {
    const start = performance.now();
    await operation();
    const end = performance.now();
    return end - start;
  },
  
  expectPerformance: (time: number, maxTime: number) => {
    expect(time).toBeLessThan(maxTime);
  }
};

export default {
  renderWithProviders,
  createTestQueryClient,
  mockApiResponses,
  mockFetch,
  setupTest,
  dbTestHelpers,
  performanceHelpers,
  customMatchers,
  mockRecipe,
  mockUser,
  mockComment
};