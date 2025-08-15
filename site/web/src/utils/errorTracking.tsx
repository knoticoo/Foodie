import React, { createContext, useContext, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Error tracking configuration
interface ErrorConfig {
  dsn?: string;
  environment: 'development' | 'staging' | 'production';
  enableInDevelopment?: boolean;
  sampleRate?: number;
  tracesSampleRate?: number;
}

// Error context
interface ErrorContextType {
  captureError: (error: Error, context?: Record<string, any>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  setUserContext: (user: { id: string; email?: string; name?: string }) => void;
  setTag: (key: string, value: string) => void;
  addBreadcrumb: (message: string, category?: string, data?: Record<string, any>) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorTracking = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorTracking must be used within ErrorTrackingProvider');
  }
  return context;
};

// Initialize Sentry
export function initializeErrorTracking(config: ErrorConfig) {
  const shouldInit = config.environment === 'production' || config.enableInDevelopment;
  
  if (!shouldInit) {
    console.log('Error tracking disabled in development');
    return;
  }

  Sentry.init({
    dsn: config.dsn || process.env.REACT_APP_SENTRY_DSN,
    environment: config.environment,
    integrations: [
      new BrowserTracing({
        // Set up automatic route change tracking
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          // useLocation,
          // useNavigationType,
          // createRoutesFromChildren,
          // matchRoutes
        ),
      }),
    ],
    sampleRate: config.sampleRate || 1.0,
    tracesSampleRate: config.tracesSampleRate || 0.1,
    
    beforeSend(event, hint) {
      // Filter out known issues
      const error = hint.originalException;
      
      // Don't send network errors in development
      if (config.environment === 'development' && 
          error instanceof Error && 
          error.message.includes('fetch')) {
        return null;
      }
      
      // Don't send React hydration warnings
      if (event.message?.includes('Warning: Text content does not match')) {
        return null;
      }
      
      // Don't send non-error level events in development
      if (config.environment === 'development' && 
          event.level !== 'error' && 
          event.level !== 'fatal') {
        return null;
      }
      
      return event;
    },
    
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
        return null;
      }
      
      // Don't track clicks on non-interactive elements
      if (breadcrumb.category === 'ui.click' && 
          !breadcrumb.message?.includes('button') &&
          !breadcrumb.message?.includes('link')) {
        return null;
      }
      
      return breadcrumb;
    }
  });

  // Set up global context
  Sentry.setTag('component', 'frontend');
  Sentry.setTag('framework', 'react');
  
  // Add release info if available
  if (process.env.REACT_APP_VERSION) {
    Sentry.setTag('version', process.env.REACT_APP_VERSION);
  }
}

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Error tracking provider
export const ErrorTrackingProvider: React.FC<{
  children: React.ReactNode;
  config: ErrorConfig;
}> = ({ children, config }) => {
  useEffect(() => {
    initializeErrorTracking(config);
  }, [config]);

  const captureError = (error: Error, context?: Record<string, any>) => {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
    
    // Also log to console in development
    if (config.environment === 'development') {
      console.error('Error captured:', error, context);
    }
  };

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    Sentry.captureMessage(message, level);
    
    if (config.environment === 'development') {
      console[level]('Message captured:', message);
    }
  };

  const setUserContext = (user: { id: string; email?: string; name?: string }) => {
    Sentry.setUser(user);
  };

  const setTag = (key: string, value: string) => {
    Sentry.setTag(key, value);
  };

  const addBreadcrumb = (message: string, category = 'custom', data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  };

  const contextValue: ErrorContextType = {
    captureError,
    captureMessage,
    setUserContext,
    setTag,
    addBreadcrumb,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Custom hooks for specific error scenarios
export const useApiErrorTracking = () => {
  const { captureError, addBreadcrumb } = useErrorTracking();
  
  return {
    trackApiError: (error: Error, endpoint: string, method: string, status?: number) => {
      addBreadcrumb(`API ${method} ${endpoint}`, 'http', {
        endpoint,
        method,
        status,
      });
      
      captureError(error, {
        endpoint,
        method,
        status,
        type: 'api_error',
      });
    },
    
    trackApiCall: (endpoint: string, method: string, duration?: number) => {
      addBreadcrumb(`API ${method} ${endpoint} completed`, 'http', {
        endpoint,
        method,
        duration,
      });
    }
  };
};

export const useUserErrorTracking = () => {
  const { captureError, addBreadcrumb, setUserContext } = useErrorTracking();
  
  return {
    trackUserAction: (action: string, data?: Record<string, any>) => {
      addBreadcrumb(`User ${action}`, 'user', data);
    },
    
    trackUserError: (error: Error, action: string) => {
      captureError(error, {
        userAction: action,
        type: 'user_error',
      });
    },
    
    setUser: setUserContext,
  };
};

export const usePerformanceTracking = () => {
  const { captureMessage, addBreadcrumb } = useErrorTracking();
  
  return {
    trackSlowOperation: (operation: string, duration: number, threshold = 1000) => {
      if (duration > threshold) {
        addBreadcrumb(`Slow operation: ${operation}`, 'performance', {
          operation,
          duration,
          threshold,
        });
        
        captureMessage(`Slow operation detected: ${operation} took ${duration}ms`, 'warning');
      }
    },
    
    trackMemoryUsage: () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (usage > 0.8) {
          captureMessage(`High memory usage: ${(usage * 100).toFixed(2)}%`, 'warning');
        }
        
        addBreadcrumb('Memory usage check', 'performance', {
          usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          usagePercent: (usage * 100).toFixed(2),
        });
      }
    }
  };
};

// Recipe-specific error tracking
export const useRecipeErrorTracking = () => {
  const { captureError, addBreadcrumb } = useErrorTracking();
  
  return {
    trackRecipeError: (error: Error, recipeId: string, action: string) => {
      addBreadcrumb(`Recipe ${action}`, 'recipe', { recipeId, action });
      
      captureError(error, {
        recipeId,
        action,
        type: 'recipe_error',
      });
    },
    
    trackRecipeView: (recipeId: string, loadTime?: number) => {
      addBreadcrumb('Recipe viewed', 'recipe', {
        recipeId,
        loadTime,
      });
    },
    
    trackRecipeInteraction: (recipeId: string, interaction: string, data?: Record<string, any>) => {
      addBreadcrumb(`Recipe ${interaction}`, 'recipe', {
        recipeId,
        interaction,
        ...data,
      });
    }
  };
};

// Error tracking utilities
export const errorUtils = {
  // Wrap async functions with error tracking
  withErrorTracking: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: string
  ): T => {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        Sentry.withScope((scope) => {
          scope.setTag('context', context);
          scope.setExtra('arguments', args);
          Sentry.captureException(error);
        });
        throw error;
      }
    }) as T;
  },
  
  // Create error with additional context
  createError: (message: string, context?: Record<string, any>) => {
    const error = new Error(message);
    if (context) {
      Object.assign(error, context);
    }
    return error;
  },
  
  // Check if error should be tracked
  shouldTrackError: (error: Error) => {
    // Don't track network errors that are expected
    if (error.message.includes('fetch') && error.message.includes('NetworkError')) {
      return false;
    }
    
    // Don't track cancelled requests
    if (error.name === 'AbortError') {
      return false;
    }
    
    // Don't track React development warnings
    if (error.message.includes('Warning:')) {
      return false;
    }
    
    return true;
  }
};

// Higher-order component for error tracking
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { captureError, addBreadcrumb } = useErrorTracking();
    
    useEffect(() => {
      addBreadcrumb(`${componentName || Component.name} mounted`, 'component');
      
      return () => {
        addBreadcrumb(`${componentName || Component.name} unmounted`, 'component');
      };
    }, [addBreadcrumb]);
    
    const errorBoundaryFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
      useEffect(() => {
        captureError(error, {
          component: componentName || Component.name,
          type: 'component_error',
        });
      }, [error]);
      
      return (
        <div className="error-boundary-fallback p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Kaut kas nogāja greizi
          </h2>
          <p className="text-red-600 mb-4">
            Komponentē {componentName || Component.name} radās kļūda.
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Mēģināt vēlreiz
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-red-700">Tehniskā informācija</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-sm overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    };
    
    return (
      <SentryErrorBoundary fallback={errorBoundaryFallback}>
        <Component {...props} />
      </SentryErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorTracking(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Performance observer for tracking web vitals
export function initializePerformanceMonitoring() {
  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        Sentry.addBreadcrumb({
          message: 'LCP measured',
          category: 'performance',
          data: { lcp: lastEntry.startTime },
          level: 'info',
        });
        
        if (lastEntry.startTime > 4000) {
          Sentry.captureMessage(`Poor LCP: ${lastEntry.startTime}ms`, 'warning');
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          
          Sentry.addBreadcrumb({
            message: 'FID measured',
            category: 'performance',
            data: { fid },
            level: 'info',
          });
          
          if (fid > 300) {
            Sentry.captureMessage(`Poor FID: ${fid}ms`, 'warning');
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            
            if (clsValue > 0.25) {
              Sentry.captureMessage(`Poor CLS: ${clsValue}`, 'warning');
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }
}

export default {
  ErrorTrackingProvider,
  useErrorTracking,
  useApiErrorTracking,
  useUserErrorTracking,
  usePerformanceTracking,
  useRecipeErrorTracking,
  withErrorTracking,
  errorUtils,
  initializeErrorTracking,
  initializePerformanceMonitoring,
};