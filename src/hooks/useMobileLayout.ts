
import { useState, useEffect } from 'react';

interface UseMobileLayoutReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  hasHover: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileLayout = (): UseMobileLayoutReturn => {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [screenHeight, setScreenHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  // Breakpoints - Using standard mobile-first approach
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // Touch and hover detection with fallbacks
  const [isTouch, setIsTouch] = useState(false);
  const [hasHover, setHasHover] = useState(true);

  // Update screen dimensions
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    }
  };

  // Detect touch capability
  const updateTouchCapability = () => {
    if (typeof window !== 'undefined') {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setHasHover(window.matchMedia('(hover: hover)').matches);
    }
  };

  // Get safe area insets for mobile devices
  const updateSafeAreaInsets = () => {
    if (typeof window !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      
      // Parse safe area insets from CSS environment variables
      const parseInset = (value: string) => {
        const num = parseFloat(value.replace('px', ''));
        return isNaN(num) ? 0 : num;
      };

      const top = parseInset(computedStyle.getPropertyValue('--safe-area-inset-top'));
      const bottom = parseInset(computedStyle.getPropertyValue('--safe-area-inset-bottom'));
      const left = parseInset(computedStyle.getPropertyValue('--safe-area-inset-left'));
      const right = parseInset(computedStyle.getPropertyValue('--safe-area-inset-right'));

      setSafeAreaInsets({ top, bottom, left, right });
    }
  };

  // Set up CSS custom properties for safe area insets
  const setupSafeAreaCSS = () => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('mobile-layout-styles');
      if (existingStyle) return; // Already set up

      const style = document.createElement('style');
      style.id = 'mobile-layout-styles';
      style.textContent = `
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
          --safe-area-inset-left: env(safe-area-inset-left, 0px);
          --safe-area-inset-right: env(safe-area-inset-right, 0px);
        }
        
        .safe-area-pt { padding-top: env(safe-area-inset-top, 0px); }
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0px); }
        .safe-area-pl { padding-left: env(safe-area-inset-left, 0px); }
        .safe-area-pr { padding-right: env(safe-area-inset-right, 0px); }
        .safe-area-p { 
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 767px) {
          .mobile-optimized {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          .mobile-scroll {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          .mobile-input {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
          
          .mobile-button {
            min-height: 44px; /* iOS recommended touch target size */
            min-width: 44px;
          }
        }
        
        /* Touch-friendly interactions */
        @media (hover: none) and (pointer: coarse) {
          .hover-only {
            display: none !important;
          }
          
          .touch-friendly {
            padding: 12px;
            margin: 4px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
  };

  // Handle viewport meta tag for mobile
  const setupViewportMeta = () => {
    if (typeof document !== 'undefined') {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      
      // Optimized viewport settings for mobile
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    }
  };

  // Initialize on mount
  useEffect(() => {
    updateDimensions();
    updateTouchCapability();
    updateSafeAreaInsets();
    setupSafeAreaCSS();
    setupViewportMeta();
  }, []);

  // Listen for resize and orientation changes
  useEffect(() => {
    const handleResize = () => {
      updateDimensions();
      updateSafeAreaInsets();
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        updateDimensions();
        updateSafeAreaInsets();
      }, 100);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, []);

  // Handle keyboard visibility on mobile
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined' && window.visualViewport) {
      const handleVisualViewportChange = () => {
        if (window.visualViewport) {
          const keyboardHeight = window.innerHeight - window.visualViewport.height;
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        }
      };

      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      };
    }
  }, [isMobile]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    orientation,
    isTouch,
    hasHover,
    safeAreaInsets,
  };
};
