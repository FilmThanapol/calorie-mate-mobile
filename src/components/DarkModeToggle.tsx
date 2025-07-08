
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDark, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={`
        relative rounded-full p-2 transition-all duration-300 hover:scale-110
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus-ring
        ${isAnimating ? 'theme-toggle-animate' : ''}
      `}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun
          className={`
            absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-500 ease-in-out
            ${isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        />

        {/* Moon icon */}
        <Moon
          className={`
            absolute inset-0 h-5 w-5 text-blue-600 dark:text-blue-400 transition-all duration-500 ease-in-out
            ${!isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        />
      </div>

      {/* Ripple effect */}
      <div
        className={`
          absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20
          transition-all duration-300 ease-out
          ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-0'}
        `}
      />
    </Button>
  );
};

export default DarkModeToggle;
