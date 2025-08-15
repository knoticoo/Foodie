import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs, API calls, and performance optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function that clears the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debouncing function calls
 * Returns a debounced version of the callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Hook for debouncing async functions
 * Automatically cancels previous calls when a new one is made
 */
export function useDebouncedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  asyncCallback: T,
  delay: number
): [(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null>, boolean] {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedCallback = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }

    return new Promise((resolve) => {
      setIsLoading(true);
      
      const newTimeoutId = setTimeout(async () => {
        try {
          const result = await asyncCallback(...args);
          setIsLoading(false);
          resolve(result);
        } catch (error) {
          setIsLoading(false);
          console.error('Debounced async callback error:', error);
          resolve(null);
        }
      }, delay);

      setTimeoutId(newTimeoutId);
    });
  };

  return [debouncedCallback, isLoading];
}

export default useDebounce;