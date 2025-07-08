import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Camera, AlertCircle, CheckCircle2, Clock, Utensils } from 'lucide-react';
import { useData, type MealData } from '@/contexts/DataContext';

interface MealEntryFormProps {
  meal?: MealData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meal: MealData) => void;
}

interface FormData {
  food_name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  date: string;
  time: string;
  image_url: string;
}

const MealEntryForm: React.FC<MealEntryFormProps> = ({ 
  meal, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { actions } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    return meal ? {
      food_name: meal.food_name,
      amount: meal.amount,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber,
      sugar: meal.sugar,
      sodium: meal.sodium,
      date: meal.date,
      time: meal.time,
      image_url: meal.image_url,
    } : {
      food_name: '',
      amount: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      date: today,
      time: currentTime,
      image_url: '',
    };
  });

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.food_name.trim()) {
      errors.push('Food name is required');
    }
    if (!formData.amount.trim()) {
      errors.push('Amount is required');
    }
    if (formData.calories < 0) {
      errors.push('Calories must be positive');
    }
    if (formData.protein < 0) {
      errors.push('Protein must be positive');
    }
    if (!formData.date) {
      errors.push('Date is required');
    }
    if (!formData.time) {
      errors.push('Time is required');
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let savedMeal: MealData;
      
      if (meal) {
        // Update existing meal
        savedMeal = await actions.updateMeal(meal.id, formData);
      } else {
        // Create new meal
        savedMeal = await actions.addMeal(formData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.(savedMeal);
        onClose();
      }, 1500);

    } catch (error) {
      setError('Failed to save meal. Please try again.');
      console.error('Error saving meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just store the file name
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleInputChange('image_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const quickFillNutrition = (type: 'protein' | 'carbs' | 'mixed') => {
    const calories = formData.calories;
    if (calories <= 0) return;

    let protein = 0, carbs = 0, fat = 0;

    switch (type) {
      case 'protein':
        protein = Math.round(calories * 0.8 / 4); // 80% protein
        fat = Math.round(calories * 0.2 / 9); // 20% fat
        break;
      case 'carbs':
        carbs = Math.round(calories * 0.8 / 4); // 80% carbs
        fat = Math.round(calories * 0.2 / 9); // 20% fat
        break;
      case 'mixed':
        protein = Math.round(calories * 0.3 / 4); // 30% protein
        carbs = Math.round(calories * 0.4 / 4); // 40% carbs
        fat = Math.round(calories * 0.3 / 9); // 30% fat
        break;
    }

    setFormData(prev => ({ ...prev, protein, carbs, fat }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="photo">Photo</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="food_name">Food Name *</Label>
                  <Input
                    id="food_name"
                    value={formData.food_name}
                    onChange={(e) => handleInputChange('food_name', e.target.value)}
                    placeholder="e.g., Grilled Chicken Breast"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="e.g., 150g, 1 cup, 2 pieces"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <div>
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              {formData.calories > 0 && (
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillNutrition('protein')}
                  >
                    High Protein
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillNutrition('carbs')}
                  >
                    High Carb
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickFillNutrition('mixed')}
                  >
                    Balanced
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => handleInputChange('protein', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => handleInputChange('carbs', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => handleInputChange('fat', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => handleInputChange('fiber', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => handleInputChange('sugar', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => handleInputChange('sodium', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4">
              <div>
                <Label htmlFor="image">Meal Photo</Label>
                <div className="mt-2">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {formData.image_url ? 'Change Photo' : 'Add Photo'}
                  </Button>
                </div>
                {formData.image_url && (
                  <div className="mt-4">
                    <img
                      src={formData.image_url}
                      alt="Meal preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {showSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Meal {meal ? 'updated' : 'added'} successfully! 🎉
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {meal ? 'Update Meal' : 'Add Meal'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealEntryForm;
