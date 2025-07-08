import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Camera, TrendingUp, History, Settings, Plus } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddMeal: () => void;
  todayMealsCount: number;
  isDark?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  onAddMeal,
  todayMealsCount,
  isDark = false
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Target,
      badge: todayMealsCount > 0 ? todayMealsCount : undefined
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp
    },
    {
      id: 'history',
      label: 'History',
      icon: History
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-40 
        ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} 
        backdrop-blur-md border-t 
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        safe-area-pb
      `}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(item.id)}
                className={`
                  relative flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? `${isDark ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50'} scale-105` 
                    : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800`
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-4"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs font-medium truncate max-w-full ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`
                    absolute -top-0.5 left-1/2 transform -translate-x-1/2 
                    w-8 h-0.5 rounded-full
                    ${isDark ? 'bg-blue-400' : 'bg-blue-600'}
                  `} />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={onAddMeal}
          size="lg"
          className={`
            w-14 h-14 rounded-full shadow-lg hover:shadow-xl
            bg-gradient-to-r from-green-500 to-blue-500 
            hover:from-green-600 hover:to-blue-600
            text-white border-0
            transition-all duration-300 ease-out
            hover:scale-110 active:scale-95
            focus:ring-4 focus:ring-green-500/30
          `}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default MobileNavigation;
