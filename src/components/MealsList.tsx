
import React from 'react';
import { Card } from "@/components/ui/card";
import { Camera } from 'lucide-react';

interface Meal {
  id: string;
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  imageUrl?: string;
  timestamp: Date;
}

interface MealsListProps {
  meals: Meal[];
}

const MealsList: React.FC<MealsListProps> = ({ meals }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-8">
        <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No meals logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <Card key={meal.id} className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {/* Meal Image */}
            <div className="flex-shrink-0">
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt={meal.foodName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Meal Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {meal.foodName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {meal.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(meal.timestamp)} at {formatTime(meal.timestamp)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {meal.calories}
                      </div>
                      <div className="text-xs text-gray-500">cal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {meal.protein}g
                      </div>
                      <div className="text-xs text-gray-500">protein</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MealsList;
