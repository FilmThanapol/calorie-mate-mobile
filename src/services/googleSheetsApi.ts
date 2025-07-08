/**
 * Google Sheets API Service
 * Handles communication with Google Apps Script Web App
 */

export interface MealData {
  date: string;
  time: string;
  food_name: string;
  amount: string;
  calories: number;
  protein: number;
  image_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SummaryStats {
  totalMeals: number;
  totalCalories: number;
  totalProtein: number;
  avgCalories: number;
  avgProtein: number;
}

class GoogleSheetsApiService {
  private baseUrl: string;
  private timeout: number = 10000; // 10 seconds

  constructor() {
    // Replace with your actual Google Apps Script Web App URL
    this.baseUrl = process.env.VITE_GOOGLE_SHEETS_API_URL || 
      'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  }

  /**
   * Set the Google Apps Script Web App URL
   */
  setApiUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please check your internet connection');
        }
        throw new Error(`Network error: ${error.message}`);
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Add a new meal to Google Sheets
   */
  async addMeal(meal: MealData): Promise<ApiResponse<MealData>> {
    try {
      // Validate meal data
      this.validateMealData(meal);

      const response = await this.makeRequest<MealData>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(meal),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to add meal');
      }

      return response;
    } catch (error) {
      console.error('Error adding meal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add meal'
      };
    }
  }

  /**
   * Fetch meals from Google Sheets
   */
  async getMeals(
    startDate?: string, 
    endDate?: string
  ): Promise<ApiResponse<MealData[]>> {
    try {
      let url = this.baseUrl;
      const params = new URLSearchParams();

      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await this.makeRequest<MealData[]>(url, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch meals');
      }

      return response;
    } catch (error) {
      console.error('Error fetching meals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meals',
        data: []
      };
    }
  }

  /**
   * Get meals for today
   */
  async getTodaysMeals(): Promise<ApiResponse<MealData[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMeals(today, today);
  }

  /**
   * Get meals for the last N days
   */
  async getRecentMeals(days: number = 7): Promise<ApiResponse<MealData[]>> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    return this.getMeals(startDate, endDate);
  }

  /**
   * Calculate daily totals from meals data
   */
  calculateDailyTotals(meals: MealData[]): Record<string, { calories: number; protein: number; count: number }> {
    const dailyTotals: Record<string, { calories: number; protein: number; count: number }> = {};

    meals.forEach(meal => {
      if (!dailyTotals[meal.date]) {
        dailyTotals[meal.date] = { calories: 0, protein: 0, count: 0 };
      }
      
      dailyTotals[meal.date].calories += meal.calories;
      dailyTotals[meal.date].protein += meal.protein;
      dailyTotals[meal.date].count += 1;
    });

    return dailyTotals;
  }

  /**
   * Get summary statistics
   */
  async getSummaryStats(
    startDate?: string, 
    endDate?: string
  ): Promise<SummaryStats> {
    try {
      const mealsResponse = await this.getMeals(startDate, endDate);
      
      if (!mealsResponse.success || !mealsResponse.data) {
        return {
          totalMeals: 0,
          totalCalories: 0,
          totalProtein: 0,
          avgCalories: 0,
          avgProtein: 0
        };
      }

      const meals = mealsResponse.data;
      const totalMeals = meals.length;
      const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

      return {
        totalMeals,
        totalCalories,
        totalProtein,
        avgCalories: totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0,
        avgProtein: totalMeals > 0 ? Math.round((totalProtein / totalMeals) * 10) / 10 : 0
      };
    } catch (error) {
      console.error('Error getting summary stats:', error);
      return {
        totalMeals: 0,
        totalCalories: 0,
        totalProtein: 0,
        avgCalories: 0,
        avgProtein: 0
      };
    }
  }

  /**
   * Validate meal data before sending to API
   */
  private validateMealData(meal: MealData): void {
    const requiredFields = ['date', 'time', 'food_name', 'amount', 'calories', 'protein'];
    
    for (const field of requiredFields) {
      if (!meal[field as keyof MealData] && meal[field as keyof MealData] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (typeof meal.calories !== 'number' || meal.calories < 0) {
      throw new Error('Calories must be a positive number');
    }

    if (typeof meal.protein !== 'number' || meal.protein < 0) {
      throw new Error('Protein must be a positive number');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(meal.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(meal.time)) {
      throw new Error('Time must be in HH:MM format');
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getMeals();
      return response.success;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleSheetsApi = new GoogleSheetsApiService();
export default googleSheetsApi;
