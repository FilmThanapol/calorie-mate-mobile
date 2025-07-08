import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Inline translations to avoid JSON import issues
const enTranslations = {
  app: {
    name: "NutriTrack",
    tagline: "Your personal nutrition companion",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    close: "Close"
  },
  navigation: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    goals: "Goals",
    notifications: "Notifications",
    calculator: "Calculator",
    about: "About"
  },
  meal: {
    addMeal: "Add Meal",
    foodName: "Food Name",
    amount: "Amount",
    calories: "Calories",
    protein: "Protein",
    todaysMeals: "Today's Meals",
    mealSaved: "Meal saved! 🎉"
  },
  goals: {
    dailyGoals: "Daily Goals",
    caloriesGoal: "Daily Calories Goal",
    proteinGoal: "Daily Protein Goal",
    goalsUpdated: "Goals updated! 🎯"
  }
};

const esTranslations = {
  app: {
    name: "NutriTrack",
    tagline: "Tu compañero personal de nutrición",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    close: "Cerrar"
  },
  navigation: {
    dashboard: "Panel",
    analytics: "Análisis",
    history: "Historial",
    settings: "Configuración",
    goals: "Objetivos",
    notifications: "Notificaciones",
    calculator: "Calculadora",
    about: "Acerca de"
  },
  meal: {
    addMeal: "Agregar Comida",
    foodName: "Nombre del Alimento",
    amount: "Cantidad",
    calories: "Calorías",
    protein: "Proteína",
    todaysMeals: "Comidas de Hoy",
    mealSaved: "¡Comida guardada! 🎉"
  },
  goals: {
    dailyGoals: "Objetivos Diarios",
    caloriesGoal: "Objetivo Diario de Calorías",
    proteinGoal: "Objetivo Diario de Proteína",
    goalsUpdated: "¡Objetivos actualizados! 🎯"
  }
};

export type SupportedLanguage = 'en' | 'es';

interface TranslationData {
  [key: string]: any;
}

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLanguages: { code: SupportedLanguage; name: string; nativeName: string }[];
}

// Available languages configuration
export const AVAILABLE_LANGUAGES = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'es' as const, name: 'Spanish', nativeName: 'Español' },
];

// Translation data
const translations: Record<SupportedLanguage, TranslationData> = {
  en: enTranslations,
  es: esTranslations,
};

// Create context
export const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get nested value from object using dot notation
const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Interpolate parameters in translation string
const interpolate = (template: string, params: Record<string, string | number> = {}): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

// Detect browser language
const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return AVAILABLE_LANGUAGES.some(lang => lang.code === browserLang) ? browserLang : 'en';
};

// Get saved language from localStorage
const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem('nutrition-tracker-language') as SupportedLanguage;
  return AVAILABLE_LANGUAGES.some(lang => lang.code === saved) ? saved : detectBrowserLanguage();
};

// Custom hook for i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
};

// Hook for creating i18n state (used in provider)
export const useI18nState = () => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    setLanguageState(savedLanguage);
  }, []);

  // Set language and save to localStorage
  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('nutrition-tracker-language', lang);
    
    // Update document language attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[language], key);
    
    if (translation === undefined) {
      // Fallback to English if translation not found
      const fallback = getNestedValue(translations.en, key);
      
      if (fallback === undefined) {
        console.warn(`Translation missing for key: ${key}`);
        return key; // Return the key itself as last resort
      }
      
      return params ? interpolate(fallback, params) : fallback;
    }
    
    return params ? interpolate(translation, params) : translation;
  }, [language]);

  return {
    language,
    setLanguage,
    t,
    availableLanguages: AVAILABLE_LANGUAGES,
  };
};

// Standalone translation function (for use outside components)
export const translate = (
  key: string, 
  params?: Record<string, string | number>, 
  lang: SupportedLanguage = 'en'
): string => {
  const translation = getNestedValue(translations[lang], key);
  
  if (translation === undefined) {
    const fallback = getNestedValue(translations.en, key);
    if (fallback === undefined) {
      return key;
    }
    return params ? interpolate(fallback, params) : fallback;
  }
  
  return params ? interpolate(translation, params) : translation;
};

// Helper function to get all translations for a specific namespace
export const getNamespaceTranslations = (
  namespace: string, 
  lang: SupportedLanguage = 'en'
): Record<string, string> => {
  const namespaceData = getNestedValue(translations[lang], namespace);
  
  if (!namespaceData || typeof namespaceData !== 'object') {
    return {};
  }
  
  const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenObject(value, newKey));
      } else if (typeof value === 'string') {
        result[newKey] = value;
      }
    }
    
    return result;
  };
  
  return flattenObject(namespaceData);
};

// Helper function to check if a translation key exists
export const hasTranslation = (key: string, lang: SupportedLanguage = 'en'): boolean => {
  return getNestedValue(translations[lang], key) !== undefined;
};

// Helper function to get language direction (for future RTL support)
export const getLanguageDirection = (lang: SupportedLanguage): 'ltr' | 'rtl' => {
  // Currently all supported languages are LTR
  // Add RTL languages here when needed (e.g., Arabic, Hebrew)
  return 'ltr';
};

// Helper function to format numbers according to locale
export const formatNumber = (
  number: number, 
  lang: SupportedLanguage = 'en',
  options?: Intl.NumberFormatOptions
): string => {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return new Intl.NumberFormat(locale, options).format(number);
};

// Helper function to format dates according to locale
export const formatDate = (
  date: Date, 
  lang: SupportedLanguage = 'en',
  options?: Intl.DateTimeFormatOptions
): string => {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(date);
};

// Helper function to format relative time
export const formatRelativeTime = (
  date: Date, 
  lang: SupportedLanguage = 'en'
): string => {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return rtf.format(diffInDays, 'day');
};
