
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Tables } from '@/integrations/supabase/types';

type Meal = Tables<'meals'>;

interface MealListProps {
  meals: Meal[];
  showDate?: boolean;
  limit?: number;
}

const MealList: React.FC<MealListProps> = ({ meals, showDate = true, limit }) => {
  const { actions } = useData();

  const displayMeals = limit ? meals.slice(0, limit) : meals;

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      await actions.deleteMeal(id);
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (displayMeals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🍽️</div>
        <p>No meals recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayMeals.map((meal) => (
        <Card key={meal.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {meal.image_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={meal.image_url}
                        alt={meal.food_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {meal.food_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {meal.amount}
                    </p>
                    {showDate && (
                      <p className="text-xs text-gray-500">
                        {formatDate(meal.date)} at {formatTime(meal.time)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-600 font-medium">🔥 {meal.calories}</span>
                    <span className="text-gray-500">cal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600 font-medium">💪 {meal.protein}g</span>
                    <span className="text-gray-500">protein</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(meal.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MealList;
