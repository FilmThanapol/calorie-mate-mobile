
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const MealCardSkeleton = () => {
  return (
    <div className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
};

export const ProgressCardSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-18" />
        </div>
        <Skeleton className="w-20 h-20 rounded-full" />
      </div>
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className="animate-pulse">
    <div className={`${height} bg-gray-100 dark:bg-gray-800 rounded-lg p-4`}>
      <div className="h-full flex items-end justify-between space-x-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton
            key={i}
            className={`w-8 ${i % 2 === 0 ? 'h-3/4' : 'h-1/2'}`}
          />
        ))}
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="animate-pulse">
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 ${colIndex === 0 ? 'w-3/4' : 'w-full'}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loading overlay
export const LoadingOverlay = ({
  isVisible,
  message = 'Loading...',
  className = ''
}: {
  isVisible: boolean;
  message?: string;
  className?: string;
}) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
      ${className}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-900 dark:text-gray-100">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Inline loading spinner
export const LoadingSpinner = ({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`
      animate-spin rounded-full border-b-2 border-blue-600
      ${sizeClasses[size]}
      ${className}
    `} />
  );
};
