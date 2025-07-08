import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Clock, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useData, type MealData } from '@/contexts/DataContext';
import MealEntryForm from './MealEntryForm';

interface MealListProps {
  meals: MealData[];
  showDate?: boolean;
  limit?: number;
}

const MealList: React.FC<MealListProps> = ({ meals, showDate = true, limit }) => {
  const { actions } = useData();
  const [editingMeal, setEditingMeal] = useState<MealData | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<MealData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayMeals = limit ? meals.slice(0, limit) : meals;

  const handleEdit = (meal: MealData) => {
    setEditingMeal(meal);
  };

  const handleDelete = async () => {
    if (!deletingMeal) return;

    setIsDeleting(true);
    setError(null);

    try {
      await actions.deleteMeal(deletingMeal.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('Failed to delete meal. Please try again.');
      console.error('Error deleting meal:', error);
    } finally {
      setIsDeleting(false);
      setDeletingMeal(null);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return dateString;
    }
  };

  const getMealTypeFromTime = (time: string): { type: string; emoji: string; color: string } => {
    const hour = parseInt(time.split(':')[0]);
    
    if (hour >= 5 && hour < 11) {
      return { type: 'Breakfast', emoji: '🌅', color: 'bg-orange-100 text-orange-800' };
    } else if (hour >= 11 && hour < 15) {
      return { type: 'Lunch', emoji: '☀️', color: 'bg-yellow-100 text-yellow-800' };
    } else if (hour >= 15 && hour < 18) {
      return { type: 'Snack', emoji: '🍎', color: 'bg-green-100 text-green-800' };
    } else if (hour >= 18 && hour < 23) {
      return { type: 'Dinner', emoji: '🌙', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { type: 'Late Night', emoji: '🌃', color: 'bg-purple-100 text-purple-800' };
    }
  };

  if (displayMeals.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals logged yet</h3>
          <p className="text-gray-600 text-center">
            Start tracking your nutrition by adding your first meal!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Meal deleted successfully! 🗑️
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {displayMeals.map((meal) => {
          const mealType = getMealTypeFromTime(meal.time);
          
          return (
            <Card key={meal.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mealType.emoji}</span>
                        <Badge className={mealType.color}>
                          {mealType.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {showDate && (
                          <span>{formatDate(meal.date)} • </span>
                        )}
                        <span>{formatTime(meal.time)}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {meal.food_name}
                      </h3>
                      <p className="text-gray-600">{meal.amount}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {meal.calories}
                        </div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {meal.protein}g
                        </div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {meal.carbs}g
                        </div>
                        <div className="text-xs text-gray-500">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {meal.fat}g
                        </div>
                        <div className="text-xs text-gray-500">Fat</div>
                      </div>
                    </div>

                    {(meal.fiber > 0 || meal.sugar > 0 || meal.sodium > 0) && (
                      <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        {meal.fiber > 0 && <span>Fiber: {meal.fiber}g</span>}
                        {meal.sugar > 0 && <span>Sugar: {meal.sugar}g</span>}
                        {meal.sodium > 0 && <span>Sodium: {meal.sodium}mg</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {meal.image_url && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden mb-2">
                        <img
                          src={meal.image_url}
                          alt={meal.food_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(meal)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingMeal(meal)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Meal Dialog */}
      {editingMeal && (
        <MealEntryForm
          meal={editingMeal}
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          onSuccess={() => setEditingMeal(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMeal} onOpenChange={() => setDeletingMeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Meal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingMeal?.food_name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MealList;
