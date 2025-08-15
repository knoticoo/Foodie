import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { FullPageLoading, LoadingSkeleton } from './LoadingStates';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingVariant?: 'full' | 'skeleton' | 'spinner';
  errorFallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  children,
  fallback,
  loadingVariant = 'full',
  errorFallback,
}) => {
  const getLoadingComponent = () => {
    if (fallback) return fallback;
    
    switch (loadingVariant) {
      case 'skeleton':
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        );
      case 'spinner':
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'full':
      default:
        return <FullPageLoading message="Ielādē lapu..." variant="default" />;
    }
  };

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={getLoadingComponent()}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;