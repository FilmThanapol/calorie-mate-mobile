import { useState, useEffect, useCallback } from 'react';
import { googleSheetsApi, type MealData, type SummaryStats } from '@/services/googleSheetsApi';
import { useToast } from '@/hooks/use-toast';

interface UseGoogleSheetsReturn {
  meals: MealData[];
  isLoading: boolean;
  error: string | null;
  summaryStats: SummaryStats;
  refreshMeals: () => Promise<void>;
  getTodaysMeals: () => MealData[];
  getRecentMeals: (days?: number) => Promise<void>;
  isOnline: boolean;
  lastSyncTime: Date | null;
}

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalMeals: 0,
    totalCalories: 0,
    totalProtein: 0,
    avgCalories: 0,
    avgProtein: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const { toast } = useToast();

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

  // Load meals from Google Sheets
  const refreshMeals = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection. Using cached data.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await googleSheetsApi.getMeals();
      
      if (response.success && response.data) {
        setMeals(response.data);
        setLastSyncTime(new Date());
        
        // Cache data locally
        localStorage.setItem('cachedMeals', JSON.stringify(response.data));
        localStorage.setItem('lastSyncTime', new Date().toISOString());
        
        // Calculate summary stats
        const stats = await googleSheetsApi.getSummaryStats();
        setSummaryStats(stats);
      } else {
        throw new Error(response.error || 'Failed to fetch meals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meals';
      setError(errorMessage);
      
      // Try to load cached data
      const cachedMeals = localStorage.getItem('cachedMeals');
      if (cachedMeals) {
        try {
          const parsedMeals = JSON.parse(cachedMeals);
          setMeals(parsedMeals);
          
          const cachedSyncTime = localStorage.getItem('lastSyncTime');
          if (cachedSyncTime) {
            setLastSyncTime(new Date(cachedSyncTime));
          }
          
          toast({
            title: "Using cached data",
            description: "Couldn't sync with Google Sheets. Showing last cached data.",
            variant: "destructive",
          });
        } catch (parseError) {
          console.error('Error parsing cached meals:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, toast]);

  // Get recent meals (last N days)
  const getRecentMeals = useCallback(async (days: number = 7) => {
    if (!isOnline) {
      setError('No internet connection. Using cached data.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await googleSheetsApi.getRecentMeals(days);
      
      if (response.success && response.data) {
        setMeals(response.data);
        setLastSyncTime(new Date());
        
        // Cache data locally
        localStorage.setItem('cachedMeals', JSON.stringify(response.data));
        localStorage.setItem('lastSyncTime', new Date().toISOString());
      } else {
        throw new Error(response.error || 'Failed to fetch recent meals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent meals';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  // Get today's meals from the current meals array
  const getTodaysMeals = useCallback((): MealData[] => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter(meal => meal.date === today);
  }, [meals]);

  // Initial load
  useEffect(() => {
    refreshMeals();
  }, [refreshMeals]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && error) {
      refreshMeals();
    }
  }, [isOnline, error, refreshMeals]);

  // Periodic sync (every 5 minutes when online and active)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshMeals();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isOnline, refreshMeals]);

  return {
    meals,
    isLoading,
    error,
    summaryStats,
    refreshMeals,
    getTodaysMeals,
    getRecentMeals,
    isOnline,
    lastSyncTime,
  };
};
