import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { googleSheetsApi, type MealData } from '../googleSheetsApi';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Google Sheets API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variable
    vi.stubEnv('VITE_GOOGLE_SHEETS_API_URL', 'https://script.google.com/macros/s/test/exec');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addMeal', () => {
    const mockMealData: MealData = {
      date: '2025-07-08',
      time: '12:30',
      food_name: 'Test Food',
      amount: '100g',
      calories: 200,
      protein: 15,
      image_url: '',
    };

    it('successfully adds a meal', async () => {
      const mockResponse = {
        success: true,
        data: mockMealData,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://script.google.com/macros/s/test/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addMeal',
            data: mockMealData,
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('handles HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(result).toEqual({
        success: false,
        error: 'HTTP error: 500 Internal Server Error',
      });
    });

    it('handles invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(result).toEqual({
        success: false,
        error: 'Invalid JSON',
      });
    });

    it('handles missing API URL', async () => {
      vi.stubEnv('VITE_GOOGLE_SHEETS_API_URL', '');

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(result).toEqual({
        success: false,
        error: 'Google Sheets API URL not configured',
      });
    });
  });

  describe('getMeals', () => {
    it('successfully retrieves meals', async () => {
      const mockMeals = [
        {
          date: '2025-07-08',
          time: '12:30',
          food_name: 'Test Food 1',
          amount: '100g',
          calories: 200,
          protein: 15,
          image_url: '',
        },
        {
          date: '2025-07-08',
          time: '18:00',
          food_name: 'Test Food 2',
          amount: '150g',
          calories: 300,
          protein: 25,
          image_url: '',
        },
      ];

      const mockResponse = {
        success: true,
        data: mockMeals,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.getMeals();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://script.google.com/macros/s/test/exec?action=getMeals'
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles empty meals response', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.getMeals();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRecentMeals', () => {
    it('retrieves meals for specified number of days', async () => {
      const mockMeals = [
        {
          date: '2025-07-08',
          time: '12:30',
          food_name: 'Recent Food',
          amount: '100g',
          calories: 200,
          protein: 15,
          image_url: '',
        },
      ];

      const mockResponse = {
        success: true,
        data: mockMeals,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.getRecentMeals(7);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://script.google.com/macros/s/test/exec?action=getRecentMeals&days=7'
      );

      expect(result).toEqual(mockResponse);
    });

    it('uses default days parameter', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await googleSheetsApi.getRecentMeals();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://script.google.com/macros/s/test/exec?action=getRecentMeals&days=30'
      );
    });
  });

  describe('getSummaryStats', () => {
    it('calculates summary statistics correctly', async () => {
      const mockMeals = [
        {
          date: '2025-07-08',
          time: '12:30',
          food_name: 'Food 1',
          amount: '100g',
          calories: 200,
          protein: 15,
          image_url: '',
        },
        {
          date: '2025-07-08',
          time: '18:00',
          food_name: 'Food 2',
          amount: '150g',
          calories: 300,
          protein: 25,
          image_url: '',
        },
      ];

      const mockResponse = {
        success: true,
        data: mockMeals,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.getSummaryStats();

      expect(result).toEqual({
        totalMeals: 2,
        totalCalories: 500,
        totalProtein: 40,
        avgCalories: 250,
        avgProtein: 20,
      });
    });

    it('handles empty meals for statistics', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await googleSheetsApi.getSummaryStats();

      expect(result).toEqual({
        totalMeals: 0,
        totalCalories: 0,
        totalProtein: 0,
        avgCalories: 0,
        avgProtein: 0,
      });
    });

    it('handles API error for statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Failed to fetch meals',
        }),
      });

      const result = await googleSheetsApi.getSummaryStats();

      expect(result).toEqual({
        totalMeals: 0,
        totalCalories: 0,
        totalProtein: 0,
        avgCalories: 0,
        avgProtein: 0,
      });
    });
  });

  describe('error handling', () => {
    it('handles timeout errors', async () => {
      const mockMealData: MealData = {
        date: '2025-07-08',
        time: '12:30',
        food_name: 'Test Food',
        amount: '100g',
        calories: 200,
        protein: 15,
        image_url: '',
      };

      mockFetch.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await googleSheetsApi.addMeal(mockMealData);

      expect(result).toEqual({
        success: false,
        error: 'Request timeout',
      });
    });

    it('handles malformed response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing success field
          data: 'invalid',
        }),
      });

      const result = await googleSheetsApi.getMeals();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
