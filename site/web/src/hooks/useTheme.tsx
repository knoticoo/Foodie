import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Detect system theme preference
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored theme from localStorage
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem('theme') as Theme;
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

// Store theme in localStorage
const storeTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Failed to store theme preference:', error);
  }
};

// Apply theme to document
const applyTheme = (theme: ResolvedTheme) => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(theme);
  
  // Update meta theme color
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
  }
  
  // Update CSS custom properties for smooth transitions
  root.style.setProperty('--theme-transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
  
  // Dispatch custom event for components that need to know about theme changes
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
};

// Theme Provider Component
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: Theme;
}> = ({ children, defaultTheme = 'system' }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Resolve the actual theme to apply
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialSystemTheme = getSystemTheme();
    
    setThemeState(storedTheme);
    setSystemTheme(initialSystemTheme);
    setMounted(true);
    
    // Apply theme immediately to prevent flash
    const resolvedInitialTheme = storedTheme === 'system' ? initialSystemTheme : storedTheme;
    applyTheme(resolvedInitialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  // Apply theme when resolved theme changes
  useEffect(() => {
    if (mounted) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme, mounted]);

  // Set theme and store preference
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storeTheme(newTheme);
  };

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If currently system, toggle to opposite of current system theme
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Component
export const ThemeToggle: React.FC<{
  variant?: 'icon' | 'dropdown' | 'switch';
  showLabel?: boolean;
  className?: string;
}> = ({ variant = 'icon', showLabel = false, className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Gaišs', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Tumšs', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'Sistēma', icon: <Monitor className="w-4 h-4" /> },
  ];

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        title={`Pārslēgt uz ${resolvedTheme === 'light' ? 'tumšo' : 'gaišo'} tēmu`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tēma
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          role="switch"
          aria-checked={resolvedTheme === 'dark'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="w-3 h-3 text-gray-600 m-0.5" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-500 m-0.5" />
            )}
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {themes.map((themeOption) => (
            <option key={themeOption.value} value={themeOption.value}>
              {themeOption.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {themes.find(t => t.value === theme)?.icon}
        </div>
      </div>
    );
  }

  return null;
};

// Hook for components that need to react to theme changes
export const useThemeEffect = (callback: (theme: ResolvedTheme) => void) => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    callback(resolvedTheme);
  }, [resolvedTheme, callback]);

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.theme);
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, [callback]);
};

// Theme-aware component wrapper
export const ThemeAware: React.FC<{
  children: (theme: ResolvedTheme) => React.ReactNode;
}> = ({ children }) => {
  const { resolvedTheme } = useTheme();
  return <>{children(resolvedTheme)}</>;
};

// Utility to check if dark mode is active
export const useDarkMode = (): boolean => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark';
};

// Theme transition component for smooth theme switching
export const ThemeTransition: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="transition-colors duration-300 ease-in-out">
      {children}
    </div>
  );
};

export default ThemeProvider;