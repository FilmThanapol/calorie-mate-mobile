
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Upload, X } from 'lucide-react';
import { useData, type MealData } from '@/contexts/DataContext';

const mealSchema = z.object({
  food_name: z.string().min(1, "Food name is required"),
  amount: z.string().min(1, "Amount is required"),
  calories: z.number().min(0, "Calories must be positive"),
  protein: z.number().min(0, "Protein must be positive"),
  image_url: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

interface MealEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  meal?: MealData; // Optional meal for editing
}

const MealEntryForm: React.FC<MealEntryFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  meal 
}) => {
  const { actions } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      food_name: '',
      amount: '',
      calories: 0,
      protein: 0,
      image_url: '',
    },
  });

  // Reset form when meal prop changes (for editing)
  useEffect(() => {
    if (meal) {
      form.setValue('food_name', meal.food_name);
      form.setValue('amount', meal.amount);
      form.setValue('calories', meal.calories);
      form.setValue('protein', meal.protein);
      form.setValue('image_url', meal.image_url || '');
      setImagePreview(meal.image_url || '');
    } else {
      form.reset();
      setImagePreview('');
    }
  }, [meal, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setValue('image_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    form.setValue('image_url', '');
  };

  const onSubmit = async (data: MealFormData) => {
    try {
      setIsSubmitting(true);
      
      if (meal) {
        // Update existing meal
        await actions.updateMeal(meal.id, {
          food_name: data.food_name,
          amount: data.amount,
          calories: data.calories,
          protein: data.protein,
          image_url: data.image_url || null,
        });
      } else {
        // Add new meal
        const now = new Date();
        const mealData = {
          food_name: data.food_name,
          amount: data.amount,
          calories: data.calories,
          protein: data.protein,
          image_url: data.image_url || null,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 8),
        };

        await actions.addMeal(mealData);
      }
      
      form.reset();
      setImagePreview('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            🍽️ {meal ? 'Edit Meal' : 'Add New Meal'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="food_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grilled Chicken Breast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 150g, 1 cup, 2 slices" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="250"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="30.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo (Optional)</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Meal preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="image" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to add photo</span>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {meal ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  meal ? 'Update Meal' : 'Add Meal'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MealEntryForm;
