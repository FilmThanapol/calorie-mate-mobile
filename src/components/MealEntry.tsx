
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Camera, Upload, Loader2, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { googleSheetsApi, type MealData } from "@/services/googleSheetsApi";
import { mealEntrySchema, type MealEntryFormData } from "@/lib/validationSchemas";
import CameraCapture from "@/components/CameraCapture";

interface MealEntryProps {
  onClose: () => void;
  onSubmit: (meal: {
    foodName: string;
    amount: string;
    calories: number;
    protein: number;
    imageUrl?: string;
  }) => void;
}

const MealEntry: React.FC<MealEntryProps> = ({ onClose, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();

  // Initialize React Hook Form with Zod validation
  const form = useForm<MealEntryFormData>({
    resolver: zodResolver(mealEntrySchema),
    defaultValues: {
      foodName: '',
      amount: '',
      calories: 0,
      protein: 0,
      imageFile: undefined,
    },
    mode: 'onChange', // Enable real-time validation
  });

  const { handleSubmit, formState: { errors, isValid, isDirty }, watch, setValue } = form;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using Zod schema
      const validation = mealEntrySchema.shape.imageFile.safeParse(file);

      if (!validation.success) {
        toast({
          title: "Invalid file",
          description: validation.error.errors[0]?.message || "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      setValue('imageFile', file, { shouldValidate: true });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('imageFile', undefined, { shouldValidate: true });
    setImagePreview('');
  };

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    setValue('imageFile', file, { shouldValidate: true });

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setShowCamera(false);
  };

  // Check if device has camera capability
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const hasCameraSupport = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const onSubmitForm = async (data: MealEntryFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      let imageUrl = '';

      // In a real app, you would upload to Google Drive here
      // For now, we'll use the preview URL
      if (data.imageFile) {
        imageUrl = imagePreview;
      }

      // Prepare meal data for Google Sheets
      const now = new Date();
      const mealData: MealData = {
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        time: now.toTimeString().slice(0, 5), // HH:MM
        food_name: data.foodName,
        amount: data.amount,
        calories: data.calories,
        protein: data.protein,
        image_url: imageUrl,
      };

      // Save to Google Sheets
      const response = await googleSheetsApi.addMeal(mealData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save meal');
      }

      // Also call the original onSubmit for local state management
      onSubmit({
        foodName: data.foodName,
        amount: data.amount,
        calories: data.calories,
        protein: data.protein,
        imageUrl,
      });

      toast({
        title: "Meal saved! 🎉",
        description: "Your meal has been saved successfully.",
      });

      // Reset form
      form.reset();
      setImagePreview('');
    } catch (error) {
      console.error('Error saving meal:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add meal. Please try again.";
      setSubmitError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Meal
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Submit Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Form Validation Status */}
          {isDirty && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Form is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Please fix the errors below</span>
                </>
              )}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              {/* Food Name Field */}
              <FormField
                control={form.control}
                name="foodName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Grilled Chicken Breast"
                        {...field}
                        className={errors.foodName ? 'border-red-500 focus:border-red-500' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 150g, 1 cup, 2 slices"
                        {...field}
                        className={errors.amount ? 'border-red-500 focus:border-red-500' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calories and Protein Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className={errors.calories ? 'border-red-500 focus:border-red-500' : ''}
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
                      <FormLabel>Protein (g) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="30.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className={errors.protein ? 'border-red-500 focus:border-red-500' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Field */}
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo (Optional)</FormLabel>
                    <FormControl>
                      <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                        errors.imageFile
                          ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}>
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
                          <div className="space-y-3">
                            {/* Camera capture button (mobile) */}
                            {isMobileDevice() && hasCameraSupport() && (
                              <button
                                type="button"
                                onClick={() => setShowCamera(true)}
                                className="w-full p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                              >
                                <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                                  <Smartphone className="h-8 w-8 mb-2" />
                                  <span className="text-sm font-medium">Take Photo</span>
                                  <span className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                    Use your camera
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* File upload option */}
                            <label htmlFor="image" className="cursor-pointer block">
                              <div className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                                isMobileDevice() && hasCameraSupport()
                                  ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}>
                                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                  <Upload className="h-6 w-6 mb-2" />
                                  <span className="text-sm font-medium">
                                    {isMobileDevice() && hasCameraSupport() ? 'Or choose from gallery' : 'Click to add photo'}
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    JPEG, PNG, WebP, GIF (max 5MB)
                                  </span>
                                </div>
                              </div>
                              <input
                                id="image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`flex-1 transition-all duration-200 ${
                    isValid && !isSubmitting
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Meal'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          isDark={false} // You can pass the actual dark mode state here
        />
      )}
    </div>
  );
};

export default MealEntry;
