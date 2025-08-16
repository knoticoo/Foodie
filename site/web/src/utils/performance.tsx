import React, { useEffect, createContext, useContext, useState } from 'react';

// Core Web Vitals and performance metrics
interface PerformanceMetrics {
  // Core Web Vitals
  CLS: number | null; // Cumulative Layout Shift
  FID: number | null; // First Input Delay
  LCP: number | null; // Largest Contentful Paint
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
  
  // Additional metrics
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  routeChangeTime: number | null;
  
  // Resource metrics
  jsHeapSize: number | null;
  totalJSHeapSize: number | null;
  usedJSHeapSize: number | null;
  
  // Connection info
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  trackEvent: (eventName: string, data?: any) => void;
  trackPageView: (pageName: string) => void;
  trackUserInteraction: (interaction: string, target?: string) => void;
  getPerformanceScore: () => number;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

// Web Vitals measurement
const measureWebVitals = (): Promise<Partial<PerformanceMetrics>> => {
  return new Promise((resolve) => {
    const metrics: Partial<PerformanceMetrics> = {};

    // Use web-vitals library if available, otherwise use PerformanceObserver
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            metrics.FID = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID measurement not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              metrics.CLS = clsValue;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS measurement not supported');
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              metrics.FCP = entry.startTime;
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP measurement not supported');
      }
    }

    // Navigation timing
    if ('performance' in window && performance.timing) {
      const timing = performance.timing;
      metrics.navigationStart = timing.navigationStart;
      metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
      metrics.TTFB = timing.responseStart - timing.navigationStart;
    }

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.jsHeapSize = memory.jsHeapSizeLimit;
      metrics.totalJSHeapSize = memory.totalJSHeapSize;
      metrics.usedJSHeapSize = memory.usedJSHeapSize;
    }

    // Connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection.type || null;
      metrics.effectiveType = connection.effectiveType || null;
      metrics.downlink = connection.downlink || null;
    }

    // Resolve after a delay to allow metrics to be collected
    setTimeout(() => resolve(metrics), 2000);
  });
};

// Calculate performance score (0-100)
const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
  let score = 100;
  
  // LCP scoring (ideal < 2.5s, poor > 4s)
  if (metrics.LCP) {
    if (metrics.LCP > 4000) score -= 25;
    else if (metrics.LCP > 2500) score -= 15;
  }
  
  // FID scoring (ideal < 100ms, poor > 300ms)
  if (metrics.FID) {
    if (metrics.FID > 300) score -= 20;
    else if (metrics.FID > 100) score -= 10;
  }
  
  // CLS scoring (ideal < 0.1, poor > 0.25)
  if (metrics.CLS) {
    if (metrics.CLS > 0.25) score -= 20;
    else if (metrics.CLS > 0.1) score -= 10;
  }
  
  // FCP scoring (ideal < 1.8s, poor > 3s)
  if (metrics.FCP) {
    if (metrics.FCP > 3000) score -= 15;
    else if (metrics.FCP > 1800) score -= 10;
  }
  
  // Memory usage scoring
  if (metrics.usedJSHeapSize && metrics.totalJSHeapSize) {
    const memoryUsage = metrics.usedJSHeapSize / metrics.totalJSHeapSize;
    if (memoryUsage > 0.8) score -= 10;
    else if (memoryUsage > 0.6) score -= 5;
  }
  
  return Math.max(0, score);
};

// Send metrics to analytics endpoint
const sendMetricsToAnalytics = (metrics: PerformanceMetrics, event?: string, data?: any) => {
  // In a real app, you would send this to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to your analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics,
        event,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(err => console.warn('Analytics reporting failed:', err));
  } else {
    console.group('🔍 Performance Metrics');
    console.log('Metrics:', metrics);
    console.log('Event:', event);
    console.log('Data:', data);
    console.log('Score:', calculatePerformanceScore(metrics));
    console.groupEnd();
  }
};

// Performance Provider Component
export const PerformanceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    CLS: null,
    FID: null,
    LCP: null,
    FCP: null,
    TTFB: null,
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    routeChangeTime: null,
    jsHeapSize: null,
    totalJSHeapSize: null,
    usedJSHeapSize: null,
    connectionType: null,
    effectiveType: null,
    downlink: null,
  });

  // Initialize performance monitoring
  useEffect(() => {
    const initializePerformanceMonitoring = async () => {
      try {
        const webVitals = await measureWebVitals();
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          ...webVitals,
        }));
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
      }
    };

    initializePerformanceMonitoring();

    // Monitor route changes
    let routeChangeStart = Date.now();
    const handleRouteChange = () => {
      const routeChangeTime = Date.now() - routeChangeStart;
      setMetrics(prev => ({ ...prev, routeChangeTime }));
      routeChangeStart = Date.now();
    };

    // Listen for route changes (React Router doesn't fire popstate for programmatic navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Monitor visibility changes for performance impact
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh metrics
        measureWebVitals().then(webVitals => {
          setMetrics(prevMetrics => ({
            ...prevMetrics,
            ...webVitals,
          }));
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Send metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      sendMetricsToAnalytics(metrics);
    }, 60000); // Send every minute

    return () => clearInterval(interval);
  }, [metrics]);

  const trackEvent = (eventName: string, data?: any) => {
    sendMetricsToAnalytics(metrics, eventName, data);
  };

  const trackPageView = (pageName: string) => {
    const pageViewData = {
      page: pageName,
      url: window.location.href,
      timestamp: Date.now(),
      loadTime: metrics.loadComplete,
    };
    sendMetricsToAnalytics(metrics, 'page_view', pageViewData);
  };

  const trackUserInteraction = (interaction: string, target?: string) => {
    const interactionData = {
      interaction,
      target,
      timestamp: Date.now(),
      currentCLS: metrics.CLS,
    };
    sendMetricsToAnalytics(metrics, 'user_interaction', interactionData);
  };

  const getPerformanceScore = () => calculatePerformanceScore(metrics);

  const contextValue: PerformanceContextType = {
    metrics,
    trackEvent,
    trackPageView,
    trackUserInteraction,
    getPerformanceScore,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Performance monitoring hook for components
export const usePagePerformance = (pageName: string) => {
  const { trackPageView, trackEvent } = usePerformance();

  useEffect(() => {
    // Track page view
    trackPageView(pageName);

    // Track time spent on page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      trackEvent('page_exit', {
        page: pageName,
        timeSpent,
      });
    };
  }, [pageName, trackPageView, trackEvent]);
};

// Performance monitoring component for debugging
export const PerformanceDebugger: React.FC = () => {
  const { metrics, getPerformanceScore } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Metrics"
      >
        📊
      </button>

      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Performance</h3>
            <div className="text-sm font-medium text-blue-600">
              Score: {getPerformanceScore()}/100
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">LCP:</span>
                <span className="ml-1 font-mono">
                  {metrics.LCP ? `${(metrics.LCP / 1000).toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">FID:</span>
                <span className="ml-1 font-mono">
                  {metrics.FID ? `${metrics.FID.toFixed(2)}ms` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">CLS:</span>
                <span className="ml-1 font-mono">
                  {metrics.CLS ? metrics.CLS.toFixed(3) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">FCP:</span>
                <span className="ml-1 font-mono">
                  {metrics.FCP ? `${(metrics.FCP / 1000).toFixed(2)}s` : 'N/A'}
                </span>
              </div>
            </div>
            
            {metrics.usedJSHeapSize && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600">Memory:</span>
                <span className="ml-1 font-mono">
                  {(metrics.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            )}
            
            {metrics.connectionType && (
              <div>
                <span className="text-gray-600">Connection:</span>
                <span className="ml-1 font-mono">
                  {metrics.effectiveType || metrics.connectionType}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceProvider;