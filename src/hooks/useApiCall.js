import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling API calls with loading states and error handling
 * @template T
 * @param {Function} apiFunction - The API function to call
 * @returns {{
 *   data: T|null,
 *   loading: boolean,
 *   error: string|null,
 *   execute: Function,
 *   reset: Function
 * }}
 */
export const useApiCall = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);

      if (result.error) {
        setError(result.error.message);
        setData(null);
        return { success: false, error: result.error };
      } else {
        setData(result.data);
        setError(null);
        return { success: true, data: result.data };
      }
    } catch (err) {
      const errorMessage = err.userMessage || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setData(null);
      return { success: false, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Custom hook for handling API calls that should execute immediately
 * @template T
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies for useEffect
 * @param {boolean} [immediate=true] - Whether to execute immediately
 * @returns {{
 *   data: T|null,
 *   loading: boolean,
 *   error: string|null,
 *   refetch: Function
 * }}
 */
export const useApiData = (apiFunction, dependencies = [], immediate = true) => {
  const { data, loading, error, execute } = useApiCall(apiFunction);

  // Execute on mount and when dependencies change
  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  // Auto-execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch
  };
};

export default useApiCall;