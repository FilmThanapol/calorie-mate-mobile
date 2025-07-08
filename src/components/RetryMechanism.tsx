import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';

interface RetryMechanismProps {
  onRetry: () => Promise<void> | void;
  error?: string | null;
  isLoading?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  showRetryCount?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  autoRetry?: boolean;
}

// Custom hook for retry logic
export const useRetry = (
  asyncFunction: () => Promise<any>,
  options: UseRetryOptions = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    autoRetry = false
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const execute = useCallback(async (attempt = 0): Promise<any> => {
    if (!isOnline && attempt === 0) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setRetryCount(0);
      setError(null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          execute(attempt + 1);
        }, delay);
      } else {
        setError(errorMessage);
        setRetryCount(attempt + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, maxRetries, retryDelay, backoffMultiplier, isOnline]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && error && autoRetry) {
      execute();
    }
  }, [isOnline, error, autoRetry, execute]);

  const retry = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return {
    execute,
    retry,
    isLoading,
    error,
    retryCount,
    isOnline,
    canRetry: retryCount < maxRetries,
  };
};

// Retry mechanism component
const RetryMechanism: React.FC<RetryMechanismProps> = ({
  onRetry,
  error,
  isLoading = false,
  maxRetries = 3,
  retryDelay = 1000,
  autoRetry = false,
  showRetryCount = true,
  className = '',
  children
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && error && autoRetry && retryCount < maxRetries) {
      handleRetry();
    }
  }, [isOnline, error, autoRetry, retryCount, maxRetries]);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const resetRetryCount = () => {
    setRetryCount(0);
  };

  // If no error and not loading, show children or nothing
  if (!error && !isLoading) {
    return children ? <>{children}</> : null;
  }

  // If loading, show loading state
  if (isLoading || isRetrying) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">
              {isRetrying ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading...'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If error, show error state with retry options
  if (error) {
    const canRetry = retryCount < maxRetries;
    
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 space-y-4">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Offline</span>
              </>
            )}
          </div>

          {/* Error message */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          {/* Retry information */}
          {showRetryCount && retryCount > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Attempt {retryCount} of {maxRetries}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              disabled={!canRetry || !isOnline}
              className="flex items-center gap-2"
              variant={canRetry ? "default" : "secondary"}
            >
              <RefreshCw className="h-4 w-4" />
              {canRetry ? 'Try Again' : 'Max Retries Reached'}
            </Button>

            {retryCount > 0 && (
              <Button
                onClick={resetRetryCount}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Offline message */}
          {!isOnline && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              You're currently offline. The retry will happen automatically when your connection is restored.
            </div>
          )}

          {/* Max retries reached message */}
          {!canRetry && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              Maximum retry attempts reached. Please refresh the page or check your internet connection.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return children ? <>{children}</> : null;
};

export default RetryMechanism;

// Higher-order component for wrapping components with retry logic
export const withRetry = <P extends object>(
  Component: React.ComponentType<P>,
  retryOptions?: UseRetryOptions
) => {
  const WrappedComponent = (props: P) => {
    const [error, setError] = useState<string | null>(null);
    
    const asyncFunction = async () => {
      try {
        // This is a placeholder - in real usage, you'd pass the actual async function
        return Promise.resolve();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    };

    const { execute, retry, isLoading, error: retryError } = useRetry(asyncFunction, retryOptions);

    return (
      <RetryMechanism
        onRetry={retry}
        error={error || retryError}
        isLoading={isLoading}
      >
        <Component {...props} />
      </RetryMechanism>
    );
  };

  WrappedComponent.displayName = `withRetry(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
