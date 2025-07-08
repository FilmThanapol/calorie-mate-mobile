import { describe, it, expect } from 'vitest';
import {
  mealEntrySchema,
  dailyGoalsSchema,
  validateMealEntry,
  validateDailyGoals,
  isValidFoodName,
  isValidAmount,
  isValidCalories,
  isValidProtein,
} from '../validationSchemas';

describe('Validation Schemas', () => {
  describe('mealEntrySchema', () => {
    it('validates a correct meal entry', () => {
      const validMeal = {
        foodName: 'Grilled Chicken Breast',
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(validMeal);
      expect(result.success).toBe(true);
    });

    it('rejects empty food name', () => {
      const invalidMeal = {
        foodName: '',
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Food name is required');
      }
    });

    it('rejects food name that is too short', () => {
      const invalidMeal = {
        foodName: 'A',
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Food name must be at least 2 characters');
      }
    });

    it('rejects food name that is too long', () => {
      const invalidMeal = {
        foodName: 'A'.repeat(101),
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Food name must be less than 100 characters');
      }
    });

    it('rejects food name with invalid characters', () => {
      const invalidMeal = {
        foodName: 'Chicken@#$%',
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Food name contains invalid characters');
      }
    });

    it('rejects negative calories', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: -10,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Calories cannot be negative');
      }
    });

    it('rejects calories that are too high', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 15000,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Calories seems too high (max 10,000)');
      }
    });

    it('rejects non-integer calories', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 250.5,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Calories must be a whole number');
      }
    });

    it('rejects negative protein', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 250,
        protein: -5,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Protein cannot be negative');
      }
    });

    it('rejects protein that is too high', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 250,
        protein: 1500,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Protein seems too high (max 1,000g)');
      }
    });

    it('accepts protein with one decimal place', () => {
      const validMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 250,
        protein: 30.5,
      };

      const result = mealEntrySchema.safeParse(validMeal);
      expect(result.success).toBe(true);
    });

    it('rejects protein with more than one decimal place', () => {
      const invalidMeal = {
        foodName: 'Test Food',
        amount: '150g',
        calories: 250,
        protein: 30.55,
      };

      const result = mealEntrySchema.safeParse(invalidMeal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Protein can have at most 1 decimal place');
      }
    });
  });

  describe('dailyGoalsSchema', () => {
    it('validates correct daily goals', () => {
      const validGoals = {
        calories: 2000,
        protein: 150,
      };

      const result = dailyGoalsSchema.safeParse(validGoals);
      expect(result.success).toBe(true);
    });

    it('rejects calories below minimum', () => {
      const invalidGoals = {
        calories: 500,
        protein: 150,
      };

      const result = dailyGoalsSchema.safeParse(invalidGoals);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Daily calories should be at least 800 for health reasons');
      }
    });

    it('rejects calories above maximum', () => {
      const invalidGoals = {
        calories: 10000,
        protein: 150,
      };

      const result = dailyGoalsSchema.safeParse(invalidGoals);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Daily calories seems too high (max 8,000)');
      }
    });

    it('rejects protein below minimum', () => {
      const invalidGoals = {
        calories: 2000,
        protein: 10,
      };

      const result = dailyGoalsSchema.safeParse(invalidGoals);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Daily protein should be at least 20g for health reasons');
      }
    });

    it('rejects protein above maximum', () => {
      const invalidGoals = {
        calories: 2000,
        protein: 600,
      };

      const result = dailyGoalsSchema.safeParse(invalidGoals);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Daily protein seems too high (max 500g)');
      }
    });
  });

  describe('validation helper functions', () => {
    describe('validateMealEntry', () => {
      it('returns success for valid data', () => {
        const validData = {
          foodName: 'Test Food',
          amount: '150g',
          calories: 250,
          protein: 30.5,
        };

        const result = validateMealEntry(validData);
        expect(result.success).toBe(true);
      });

      it('returns error for invalid data', () => {
        const invalidData = {
          foodName: '',
          amount: '150g',
          calories: 250,
          protein: 30.5,
        };

        const result = validateMealEntry(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('validateDailyGoals', () => {
      it('returns success for valid goals', () => {
        const validGoals = {
          calories: 2000,
          protein: 150,
        };

        const result = validateDailyGoals(validGoals);
        expect(result.success).toBe(true);
      });

      it('returns error for invalid goals', () => {
        const invalidGoals = {
          calories: 500,
          protein: 150,
        };

        const result = validateDailyGoals(invalidGoals);
        expect(result.success).toBe(false);
      });
    });

    describe('field-specific validators', () => {
      it('validates food names correctly', () => {
        expect(isValidFoodName('Chicken Breast')).toBe(true);
        expect(isValidFoodName('')).toBe(false);
        expect(isValidFoodName('A')).toBe(false);
        expect(isValidFoodName('A'.repeat(101))).toBe(false);
      });

      it('validates amounts correctly', () => {
        expect(isValidAmount('150g')).toBe(true);
        expect(isValidAmount('1 cup')).toBe(true);
        expect(isValidAmount('')).toBe(false);
        expect(isValidAmount('A'.repeat(51))).toBe(false);
      });

      it('validates calories correctly', () => {
        expect(isValidCalories(250)).toBe(true);
        expect(isValidCalories(0)).toBe(true);
        expect(isValidCalories(-10)).toBe(false);
        expect(isValidCalories(15000)).toBe(false);
      });

      it('validates protein correctly', () => {
        expect(isValidProtein(30.5)).toBe(true);
        expect(isValidProtein(0)).toBe(true);
        expect(isValidProtein(-5)).toBe(false);
        expect(isValidProtein(1500)).toBe(false);
      });
    });
  });
});
