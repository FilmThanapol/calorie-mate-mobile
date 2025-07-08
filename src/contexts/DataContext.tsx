import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface MealData {
  id: string;
  date: string;
  time: string;
  food_name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
}

export interface AppSettings {
  dailyGoals: DailyGoals;
  notifications: {
    mealReminders: boolean;
    goalReminders: boolean;
    waterReminders: boolean;
  };
  language: string;
  theme: 'light' | 'dark';
}

interface DataState {
  meals: MealData[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { meals: MealData[]; settings: AppSettings } }
  | { type: 'ADD_MEAL'; payload: MealData }
  | { type: 'UPDATE_MEAL'; payload: MealData }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const initialSettings: AppSettings = {
  dailyGoals: { calories: 2000, protein: 150 },
  notifications: {
    mealReminders: false,
    goalReminders: false,
    waterReminders: false,
  },
  language: 'en',
  theme: 'light',
};

const initialState: DataState = {
  meals: [],
  settings: initialSettings,
  isLoading: false,
  error: null,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_DATA':
      return {
        ...state,
        meals: action.payload.meals,
        settings: action.payload.settings,
        isLoading: false,
        error: null,
      };
    case 'ADD_MEAL':
      return {
        ...state,
        meals: [...state.meals, action.payload],
        error: null,
      };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id ? action.payload : meal
        ),
        error: null,
      };
    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload),
        error: null,
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        error: null,
      };
    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  actions: {
    addMeal: (meal: Omit<MealData, 'id' | 'created_at' | 'updated_at'>) => Promise<MealData>;
    updateMeal: (id: string, meal: Partial<MealData>) => Promise<MealData>;
    deleteMeal: (id: string) => Promise<void>;
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
    loadData: () => Promise<void>;
    exportData: () => string;
    importData: (data: string) => Promise<void>;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  MEALS: 'nutritrack_meals',
  SETTINGS: 'nutritrack_settings',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.meals.length > 0 || Object.keys(state.settings).length > 0) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(state.meals));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    }
  }, [state.meals, state.settings]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const mealsData = localStorage.getItem(STORAGE_KEYS.MEALS);
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      const meals: MealData[] = mealsData ? JSON.parse(mealsData) : [];
      const settings: AppSettings = settingsData ? 
        { ...initialSettings, ...JSON.parse(settingsData) } : 
        initialSettings;
      
      dispatch({ type: 'LOAD_DATA', payload: { meals, settings } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      console.error('Error loading data:', error);
    }
  };

  const addMeal = async (mealData: Omit<MealData, 'id' | 'created_at' | 'updated_at'>): Promise<MealData> => {
    try {
      const now = new Date().toISOString();
      const newMeal: MealData = {
        ...mealData,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      
      dispatch({ type: 'ADD_MEAL', payload: newMeal });
      return newMeal;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add meal' });
      throw error;
    }
  };

  const updateMeal = async (id: string, mealData: Partial<MealData>): Promise<MealData> => {
    try {
      const existingMeal = state.meals.find(meal => meal.id === id);
      if (!existingMeal) {
        throw new Error('Meal not found');
      }
      
      const updatedMeal: MealData = {
        ...existingMeal,
        ...mealData,
        updated_at: new Date().toISOString(),
      };
      
      dispatch({ type: 'UPDATE_MEAL', payload: updatedMeal });
      return updatedMeal;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update meal' });
      throw error;
    }
  };

  const deleteMeal = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'DELETE_MEAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete meal' });
      throw error;
    }
  };

  const updateSettings = async (settings: Partial<AppSettings>): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update settings' });
      throw error;
    }
  };

  const exportData = (): string => {
    const exportData = {
      meals: state.meals,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = async (data: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const parsedData = JSON.parse(data);
      
      if (parsedData.meals && parsedData.settings) {
        dispatch({ 
          type: 'LOAD_DATA', 
          payload: { 
            meals: parsedData.meals, 
            settings: { ...initialSettings, ...parsedData.settings } 
          } 
        });
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data' });
      throw error;
    }
  };

  const contextValue: DataContextType = {
    state,
    actions: {
      addMeal,
      updateMeal,
      deleteMeal,
      updateSettings,
      loadData,
      exportData,
      importData,
    },
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
