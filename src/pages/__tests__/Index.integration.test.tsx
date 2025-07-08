import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { googleSheetsApi } from '@/services/googleSheetsApi';

// Mock the Google Sheets API
vi.mock('@/services/googleSheetsApi', () => ({
  googleSheetsApi: {
    addMeal: vi.fn(),
    getMeals: vi.fn(),
    getRecentMeals: vi.fn(),
  },
}));

// Mock the notification service
vi.mock('@/services/notificationService', () => ({
  notificationService: {
    isSupported: () => true,
    isEnabled: () => true,
    setFallbackCallback: vi.fn(),
    show: vi.fn(),
    scheduleNotification: vi.fn(),
    cancelScheduledNotification: vi.fn(),
    getSettings: () => ({}),
    updateSettings: vi.fn(),
    setEnabled: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Index Page Integration Tests', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <BrowserRouter>
              {component}
            </BrowserRouter>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    
    // Mock successful API responses
    vi.mocked(googleSheetsApi.getMeals).mockResolvedValue({
      success: true,
      data: [],
    });
    
    vi.mocked(googleSheetsApi.getRecentMeals).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the main dashboard', async () => {
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText(/nutritrack/i)).toBeInTheDocument();
      expect(screen.getByText(/your personal nutrition companion/i)).toBeInTheDocument();
    });
  });

  it('displays progress rings with correct data', async () => {
    const mockMeals = [
      {
        date: new Date().toISOString().split('T')[0],
        time: '12:30',
        food_name: 'Test Food',
        amount: '100g',
        calories: 500,
        protein: 25,
        image_url: '',
      },
    ];

    vi.mocked(googleSheetsApi.getRecentMeals).mockResolvedValue({
      success: true,
      data: mockMeals,
    });

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument(); // Calories
      expect(screen.getByText('25g')).toBeInTheDocument(); // Protein
    });
  });

  it('opens meal entry modal when add meal button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add meal/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/add new meal/i)).toBeInTheDocument();
    });
  });

  it('successfully adds a meal through the complete flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful meal addition
    vi.mocked(googleSheetsApi.addMeal).mockResolvedValue({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        time: '12:30',
        food_name: 'Integration Test Food',
        amount: '200g',
        calories: 400,
        protein: 30,
        image_url: '',
      },
    });

    renderWithProviders(<Index />);

    // Open meal entry modal
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add meal/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(addButton);

    // Fill in the form
    await waitFor(() => {
      expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/food name/i), 'Integration Test Food');
    await user.type(screen.getByLabelText(/amount/i), '200g');
    await user.type(screen.getByLabelText(/calories/i), '400');
    await user.type(screen.getByLabelText(/protein/i), '30');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(submitButton);

    // Verify API was called
    await waitFor(() => {
      expect(googleSheetsApi.addMeal).toHaveBeenCalledWith(
        expect.objectContaining({
          food_name: 'Integration Test Food',
          amount: '200g',
          calories: 400,
          protein: 30,
        })
      );
    });
  });

  it('navigates between tabs correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /dashboard/i })).toBeInTheDocument();
    });

    // Navigate to Analytics tab
    const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
    await user.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText(/weekly progress/i)).toBeInTheDocument();
    });

    // Navigate to History tab
    const historyTab = screen.getByRole('tab', { name: /history/i });
    await user.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText(/meal history/i)).toBeInTheDocument();
    });

    // Navigate to Settings tab
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText(/daily nutrition goals/i)).toBeInTheDocument();
    });
  });

  it('updates daily goals successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    // Navigate to settings
    await waitFor(() => {
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      expect(settingsTab).toBeInTheDocument();
    });

    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    // Update goals
    await waitFor(() => {
      expect(screen.getByLabelText(/daily calories goal/i)).toBeInTheDocument();
    });

    const caloriesInput = screen.getByLabelText(/daily calories goal/i);
    const proteinInput = screen.getByLabelText(/daily protein goal/i);

    await user.clear(caloriesInput);
    await user.type(caloriesInput, '2500');
    
    await user.clear(proteinInput);
    await user.type(proteinInput, '180');

    const saveButton = screen.getByRole('button', { name: /save goals/i });
    await user.click(saveButton);

    // Verify localStorage was updated
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dailyGoals',
        JSON.stringify({ calories: 2500, protein: 180 })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.mocked(googleSheetsApi.getRecentMeals).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    renderWithProviders(<Index />);

    // Should still render the page without crashing
    await waitFor(() => {
      expect(screen.getByText(/nutritrack/i)).toBeInTheDocument();
    });
  });

  it('displays loading states correctly', async () => {
    // Mock slow API response
    vi.mocked(googleSheetsApi.getRecentMeals).mockImplementation(
      () => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, data: [] }), 1000)
      )
    );

    renderWithProviders(<Index />);

    // Should show loading skeletons
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0);
  });

  it('persists theme preference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    // Find and click theme toggle
    await waitFor(() => {
      const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    const themeToggle = screen.getByRole('button', { name: /switch to dark theme/i });
    await user.click(themeToggle);

    // Verify theme was persisted
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nutrition-tracker-theme',
        'dark'
      );
    });
  });
});
