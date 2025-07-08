import { z } from 'zod';

// Meal entry validation schema
export const mealEntrySchema = z.object({
  foodName: z
    .string()
    .min(1, 'Food name is required')
    .min(2, 'Food name must be at least 2 characters')
    .max(100, 'Food name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'.,()&]+$/, 'Food name contains invalid characters'),
  
  amount: z
    .string()
    .min(1, 'Amount is required')
    .max(50, 'Amount must be less than 50 characters')
    .regex(/^[\d\s\w.,()/-]+$/, 'Amount contains invalid characters'),
  
  calories: z
    .number({
      required_error: 'Calories is required',
      invalid_type_error: 'Calories must be a number',
    })
    .min(0, 'Calories cannot be negative')
    .max(10000, 'Calories seems too high (max 10,000)')
    .int('Calories must be a whole number'),
  
  protein: z
    .number({
      required_error: 'Protein is required',
      invalid_type_error: 'Protein must be a number',
    })
    .min(0, 'Protein cannot be negative')
    .max(1000, 'Protein seems too high (max 1,000g)')
    .multipleOf(0.1, 'Protein can have at most 1 decimal place'),
  
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Image must be smaller than 5MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'Image must be JPEG, PNG, WebP, or GIF format'
    ),
});

// Daily goals validation schema
export const dailyGoalsSchema = z.object({
  calories: z
    .number({
      required_error: 'Daily calorie goal is required',
      invalid_type_error: 'Calories must be a number',
    })
    .min(800, 'Daily calories should be at least 800 for health reasons')
    .max(8000, 'Daily calories seems too high (max 8,000)')
    .int('Calories must be a whole number'),
  
  protein: z
    .number({
      required_error: 'Daily protein goal is required',
      invalid_type_error: 'Protein must be a number',
    })
    .min(20, 'Daily protein should be at least 20g for health reasons')
    .max(500, 'Daily protein seems too high (max 500g)')
    .multipleOf(0.1, 'Protein can have at most 1 decimal place'),
});

// User profile validation schema (for BMR/TDEE calculation)
export const userProfileSchema = z.object({
  age: z
    .number({
      required_error: 'Age is required',
      invalid_type_error: 'Age must be a number',
    })
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must be less than 120')
    .int('Age must be a whole number'),
  
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Please select a valid gender',
  }),
  
  weight: z
    .number({
      required_error: 'Weight is required',
      invalid_type_error: 'Weight must be a number',
    })
    .min(20, 'Weight must be at least 20kg')
    .max(500, 'Weight must be less than 500kg')
    .multipleOf(0.1, 'Weight can have at most 1 decimal place'),
  
  height: z
    .number({
      required_error: 'Height is required',
      invalid_type_error: 'Height must be a number',
    })
    .min(100, 'Height must be at least 100cm')
    .max(250, 'Height must be less than 250cm')
    .int('Height must be a whole number'),
  
  activityLevel: z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extremely_active'
  ], {
    required_error: 'Activity level is required',
    invalid_type_error: 'Please select a valid activity level',
  }),
  
  goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight'], {
    required_error: 'Goal is required',
    invalid_type_error: 'Please select a valid goal',
  }),
});

// Search/filter validation schema
export const searchFilterSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term must be less than 100 characters')
    .optional(),
  
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  
  minCalories: z
    .number()
    .min(0, 'Minimum calories cannot be negative')
    .max(10000, 'Minimum calories seems too high')
    .optional(),
  
  maxCalories: z
    .number()
    .min(0, 'Maximum calories cannot be negative')
    .max(10000, 'Maximum calories seems too high')
    .optional(),
  
  minProtein: z
    .number()
    .min(0, 'Minimum protein cannot be negative')
    .max(1000, 'Minimum protein seems too high')
    .optional(),
  
  maxProtein: z
    .number()
    .min(0, 'Maximum protein cannot be negative')
    .max(1000, 'Maximum protein seems too high')
    .optional(),
}).refine(
  (data) => !data.dateFrom || !data.dateTo || new Date(data.dateFrom) <= new Date(data.dateTo),
  {
    message: 'Start date must be before or equal to end date',
    path: ['dateTo'],
  }
).refine(
  (data) => !data.minCalories || !data.maxCalories || data.minCalories <= data.maxCalories,
  {
    message: 'Minimum calories must be less than or equal to maximum calories',
    path: ['maxCalories'],
  }
).refine(
  (data) => !data.minProtein || !data.maxProtein || data.minProtein <= data.maxProtein,
  {
    message: 'Minimum protein must be less than or equal to maximum protein',
    path: ['maxProtein'],
  }
);

// Export types for TypeScript
export type MealEntryFormData = z.infer<typeof mealEntrySchema>;
export type DailyGoalsFormData = z.infer<typeof dailyGoalsSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type SearchFilterFormData = z.infer<typeof searchFilterSchema>;

// Validation helper functions
export const validateMealEntry = (data: unknown) => {
  return mealEntrySchema.safeParse(data);
};

export const validateDailyGoals = (data: unknown) => {
  return dailyGoalsSchema.safeParse(data);
};

export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};

export const validateSearchFilter = (data: unknown) => {
  return searchFilterSchema.safeParse(data);
};

// Custom validation messages
export const getValidationErrorMessage = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  return firstError?.message || 'Validation error occurred';
};

// Field-specific validation helpers
export const isValidFoodName = (name: string): boolean => {
  return mealEntrySchema.shape.foodName.safeParse(name).success;
};

export const isValidAmount = (amount: string): boolean => {
  return mealEntrySchema.shape.amount.safeParse(amount).success;
};

export const isValidCalories = (calories: number): boolean => {
  return mealEntrySchema.shape.calories.safeParse(calories).success;
};

export const isValidProtein = (protein: number): boolean => {
  return mealEntrySchema.shape.protein.safeParse(protein).success;
};

// Real-time validation debounce helper
export const createDebouncedValidator = <T>(
  validator: (data: T) => z.SafeParseReturnType<T, T>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (data: T, callback: (result: z.SafeParseReturnType<T, T>) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(data);
      callback(result);
    }, delay);
  };
};
