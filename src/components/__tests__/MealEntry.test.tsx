
/// <reference types="../../../src/test/vitest-setup" />

import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MealEntry from '../MealEntry';
import { googleSheetsApi } from '@/services/googleSheetsApi';

// Mock the Google Sheets API
vi.mock('@/services/googleSheetsApi', () => ({
  googleSheetsApi: {
    addMeal: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the validation schemas
vi.mock('@/lib/validationSchemas', () => ({
  mealEntrySchema: {
    safeParse: vi.fn(),
    shape: {
      imageFile: {
        safeParse: vi.fn(),
      },
    },
  },
}));

describe('MealEntry Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderMealEntry = () => {
    return render(
      <MealEntry onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );
  };

  it('renders all form fields', () => {
    renderMealEntry();

    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protein/i)).toBeInTheDocument();
    expect(screen.getByText(/photo/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const submitButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/food name is required/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    vi.mocked(googleSheetsApi.addMeal).mockResolvedValue({
      success: true,
      data: {
        date: '2025-07-08',
        time: '12:30',
        food_name: 'Test Food',
        amount: '100g',
        calories: 200,
        protein: 15,
        image_url: '',
      },
    });

    renderMealEntry();

    // Fill in the form
    await user.type(screen.getByLabelText(/food name/i), 'Test Food');
    await user.type(screen.getByLabelText(/amount/i), '100g');
    await user.type(screen.getByLabelText(/calories/i), '200');
    await user.type(screen.getByLabelText(/protein/i), '15');

    const submitButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(googleSheetsApi.addMeal).toHaveBeenCalledWith(
        expect.objectContaining({
          food_name: 'Test Food',
          amount: '100g',
          calories: 200,
          protein: 15,
        })
      );
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      foodName: 'Test Food',
      amount: '100g',
      calories: 200,
      protein: 15,
      imageUrl: '',
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    vi.mocked(googleSheetsApi.addMeal).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    renderMealEntry();

    // Fill in the form
    await user.type(screen.getByLabelText(/food name/i), 'Test Food');
    await user.type(screen.getByLabelText(/amount/i), '100g');
    await user.type(screen.getByLabelText(/calories/i), '200');
    await user.type(screen.getByLabelText(/protein/i), '15');

    const submitButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Should not call onSubmit on error
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates numeric inputs', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const caloriesInput = screen.getByLabelText(/calories/i);
    const proteinInput = screen.getByLabelText(/protein/i);

    // Test invalid calories
    await user.type(caloriesInput, 'invalid');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/calories must be a number/i)).toBeInTheDocument();
    });

    // Test negative protein
    await user.clear(proteinInput);
    await user.type(proteinInput, '-5');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/protein cannot be negative/i)).toBeInTheDocument();
    });
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/choose from gallery/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByAltText(/meal preview/i)).toBeInTheDocument();
    });
  });

  it('removes uploaded image when X button is clicked', async () => {
    const user = userEvent.setup();
    renderMealEntry();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/choose from gallery/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByAltText(/meal preview/i)).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove image/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByAltText(/meal preview/i)).not.toBeInTheDocument();
    });
  });

  it('disables submit button when form is invalid', () => {
    renderMealEntry();

    const submitButton = screen.getByRole('button', { name: /add meal/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock slow API response
    vi.mocked(googleSheetsApi.addMeal).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    );

    renderMealEntry();

    // Fill in the form
    await user.type(screen.getByLabelText(/food name/i), 'Test Food');
    await user.type(screen.getByLabelText(/amount/i), '100g');
    await user.type(screen.getByLabelText(/calories/i), '200');
    await user.type(screen.getByLabelText(/protein/i), '15');

    const submitButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(submitButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
