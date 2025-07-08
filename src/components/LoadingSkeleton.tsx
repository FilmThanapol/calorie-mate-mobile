
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
