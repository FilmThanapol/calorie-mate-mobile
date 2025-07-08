
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Meal = Tables<'meals'>;
type Settings = Tables<'settings'>;

// Export MealData type for external use
export type MealData = Meal;

interface DataState {
  meals: Meal[];
  settings: Settings;
  isLoading: boolean;
  error: string | null;
}

interface DataActions {
  addMeal: (meal: Omit<Meal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: () => string;
  importData: (jsonData: string) => Promise<void>;
}

interface DataContextType {
  state: DataState;
  actions: DataActions;
}

type DataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEALS'; payload: Meal[] }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: { id: string; updates: Partial<Meal> } }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Settings };

const initialState: DataState = {
  meals: [],
  settings: {
    id: '',
    daily_calories: 2000,
    daily_protein: 150.0,
    created_at: '',
    updated_at: '',
  },
  isLoading: true,
  error: null,
};

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_MEALS':
      return { ...state, meals: action.payload };
    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id ? { ...meal, ...action.payload.updates } : meal
        ),
      };
    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { toast } = useToast();

  // Load initial data
  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load meals
      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });

      if (mealsError) throw mealsError;

      // Load settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      dispatch({ type: 'SET_MEALS', payload: meals || [] });
      if (settings) {
        dispatch({ type: 'SET_SETTINGS', payload: settings });
      }
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add meal
  const addMeal = async (mealData: Omit<Meal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([mealData])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_MEAL', payload: data });
      toast({
        title: "Success! 🎉",
        description: "Meal added successfully.",
      });
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update meal
  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    try {
      const { error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_MEAL', payload: { id, updates } });
      toast({
        title: "Success",
        description: "Meal updated successfully.",
      });
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Error",
        description: "Failed to update meal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete meal
  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_MEAL', payload: id });
      toast({
        title: "Success",
        description: "Meal deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error",
        description: "Failed to delete meal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', state.settings.id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'SET_SETTINGS', payload: data });
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Export data
  const exportData = () => {
    const exportObject = {
      meals: state.meals,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportObject, null, 2);
  };

  // Import data
  const importData = async (jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData);
      
      if (importedData.meals && Array.isArray(importedData.meals)) {
        // Import meals
        for (const meal of importedData.meals) {
          const { id, created_at, updated_at, ...mealData } = meal;
          await addMeal({
            ...mealData,
            date: mealData.date || new Date().toISOString().split('T')[0],
            time: mealData.time || new Date().toTimeString().slice(0, 8),
          });
        }
      }

      if (importedData.settings) {
        const { id, created_at, updated_at, ...settingsData } = importedData.settings;
        await updateSettings(settingsData);
      }

      toast({
        title: "Success",
        description: "Data imported successfully.",
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check the format.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to meals changes
    const mealsSubscription = supabase
      .channel('meals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, (payload) => {
        console.log('Meals change received:', payload);
        
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD_MEAL', payload: payload.new as Meal });
        } else if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_MEAL', payload: { id: payload.new.id, updates: payload.new as Partial<Meal> } });
        } else if (payload.eventType === 'DELETE') {
          dispatch({ type: 'DELETE_MEAL', payload: payload.old.id });
        }
      })
      .subscribe();

    // Subscribe to settings changes
    const settingsSubscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        console.log('Settings change received:', payload);
        
        if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'SET_SETTINGS', payload: payload.new as Settings });
        }
      })
      .subscribe();

    return () => {
      mealsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, []);

  const actions: DataActions = {
    addMeal,
    updateMeal,
    deleteMeal,
    updateSettings,
    refreshData: loadData,
    exportData,
    importData,
  };

  return (
    <DataContext.Provider value={{ state, actions }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
