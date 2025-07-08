
import { useState, useEffect, useCallback } from 'react';

interface UseDarkModeReturn {
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  systemPreference: boolean;
}

export const useDarkMode = (): UseDarkModeReturn => {
  // Get system preference
  const getSystemPreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, []);

  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-preference');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      // If no preference saved, use system preference
      return getSystemPreference();
    }
    return false;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches);

      // Only update theme if user hasn't set a manual preference
      const savedPreference = localStorage.getItem('theme-preference');
      if (!savedPreference || savedPreference === 'system') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes to DOM with smooth transition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Add transition class for smooth theme switching
    root.style.setProperty('transition', 'background-color 500ms ease-in-out, color 500ms ease-in-out');

    if (isDark) {
      root.classList.add('dark');
      // Store preference
      localStorage.setItem('theme-preference', 'dark');
    } else {
      root.classList.remove('dark');
      // Store preference
      localStorage.setItem('theme-preference', 'light');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = isDark ? '#121212' : '#ffffff';
      document.head.appendChild(meta);
    }

    // Clean up transition after theme change completes
    const timeoutId = setTimeout(() => {
      root.style.removeProperty('transition');
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setIsDark(dark);
  }, []);

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    systemPreference
  };
};
