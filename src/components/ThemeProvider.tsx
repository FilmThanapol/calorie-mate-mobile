import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
  systemTheme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'nutrition-tracker-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on theme setting and system preference
  const actualTheme: 'dark' | 'light' = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    // Initialize system theme
    setSystemTheme(getSystemTheme());

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    setMounted(true);
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add smooth transition for theme changes
    root.style.setProperty('transition', 'background-color 500ms ease-in-out, color 500ms ease-in-out');
    
    // Apply new theme
    root.classList.add(actualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeColor = actualTheme === 'dark' ? '#121212' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColor;
      document.head.appendChild(meta);
    }

    // Save theme preference
    localStorage.setItem(storageKey, theme);

    // Clean up transition after theme change completes
    const timeoutId = setTimeout(() => {
      root.style.removeProperty('transition');
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [theme, actualTheme, systemTheme, storageKey, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeProviderContextType = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
    systemTheme,
    toggleTheme,
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Enhanced theme toggle component
interface EnhancedThemeToggleProps {
  className?: string;
}

export const EnhancedThemeToggle: React.FC<EnhancedThemeToggleProps> = ({ className = '' }) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    
    // Cycle through themes: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-blue-600 opacity-20" />
          <span className="relative text-xs font-medium">SYS</span>
        </div>
      );
    }
    
    return actualTheme === 'dark' ? (
      <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    );
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative rounded-full p-2 transition-all duration-300 hover:scale-110 
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        ${isAnimating ? 'theme-toggle-animate' : ''}
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      title={`Current: ${theme} theme`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {getIcon()}
      </div>
      
      {/* Ripple effect */}
      <div 
        className={`
          absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20 
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-0'}
        `}
      />
    </button>
  );
};
