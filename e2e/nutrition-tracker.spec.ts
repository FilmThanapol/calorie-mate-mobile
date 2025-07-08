import { test, expect } from '@playwright/test';

test.describe('NutriTrack E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.getByText('NutriTrack')).toBeVisible();
  });

  test('should display the main dashboard', async ({ page }) => {
    // Check if main elements are visible
    await expect(page.getByText('NutriTrack')).toBeVisible();
    await expect(page.getByText('Your personal nutrition companion')).toBeVisible();
    
    // Check if progress rings are visible
    await expect(page.getByText('Calories')).toBeVisible();
    await expect(page.getByText('Protein')).toBeVisible();
    
    // Check if navigation tabs are visible
    await expect(page.getByRole('tab', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /analytics/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /history/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /settings/i })).toBeVisible();
  });

  test('should open and close meal entry modal', async ({ page }) => {
    // Click the Add Meal button
    await page.getByRole('button', { name: /add meal/i }).click();
    
    // Check if modal is open
    await expect(page.getByText('Add New Meal')).toBeVisible();
    await expect(page.getByLabelText(/food name/i)).toBeVisible();
    
    // Close modal by clicking X button
    await page.getByRole('button', { name: /close/i }).click();
    
    // Check if modal is closed
    await expect(page.getByText('Add New Meal')).not.toBeVisible();
  });

  test('should validate meal entry form', async ({ page }) => {
    // Open meal entry modal
    await page.getByRole('button', { name: /add meal/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /add meal/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/food name is required/i)).toBeVisible();
    await expect(page.getByText(/amount is required/i)).toBeVisible();
    
    // Fill in valid data
    await page.getByLabelText(/food name/i).fill('Grilled Chicken');
    await page.getByLabelText(/amount/i).fill('150g');
    await page.getByLabelText(/calories/i).fill('250');
    await page.getByLabelText(/protein/i).fill('30');
    
    // Form should be valid now (submit button enabled)
    await expect(page.getByRole('button', { name: /add meal/i })).toBeEnabled();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Navigate to Analytics tab
    await page.getByRole('tab', { name: /analytics/i }).click();
    await expect(page.getByText(/weekly progress/i)).toBeVisible();
    
    // Navigate to History tab
    await page.getByRole('tab', { name: /history/i }).click();
    await expect(page.getByText(/meal history/i)).toBeVisible();
    
    // Navigate to Settings tab
    await page.getByRole('tab', { name: /settings/i }).click();
    await expect(page.getByText(/daily nutrition goals/i)).toBeVisible();
    
    // Navigate back to Dashboard
    await page.getByRole('tab', { name: /dashboard/i }).click();
    await expect(page.getByText(/today's meals/i)).toBeVisible();
  });

  test('should update daily goals', async ({ page }) => {
    // Navigate to Settings tab
    await page.getByRole('tab', { name: /settings/i }).click();
    
    // Update calorie goal
    const caloriesInput = page.getByLabelText(/daily calories goal/i);
    await caloriesInput.clear();
    await caloriesInput.fill('2500');
    
    // Update protein goal
    const proteinInput = page.getByLabelText(/daily protein goal/i);
    await proteinInput.clear();
    await proteinInput.fill('180');
    
    // Save goals
    await page.getByRole('button', { name: /save goals/i }).click();
    
    // Check for success message (assuming toast notification)
    await expect(page.getByText(/goals updated/i)).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find and click the theme toggle button
    const themeToggle = page.getByRole('button', { name: /switch to dark theme/i });
    await themeToggle.click();
    
    // Check if dark mode is applied (body should have dark class)
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Toggle back to light mode
    await page.getByRole('button', { name: /switch to light theme/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check if desktop tabs are hidden on mobile
    await expect(page.getByRole('tablist')).not.toBeVisible();
    
    // Check if floating action button is visible
    await expect(page.getByRole('button', { name: /add meal/i })).toBeVisible();
  });

  test('should search and filter meal history', async ({ page }) => {
    // Navigate to History tab
    await page.getByRole('tab', { name: /history/i }).click();
    
    // Check if search input is visible
    await expect(page.getByPlaceholder(/search meals/i)).toBeVisible();
    
    // Check if filter options are available
    await expect(page.getByText(/filter by date/i)).toBeVisible();
    
    // Try searching (even if no results)
    await page.getByPlaceholder(/search meals/i).fill('chicken');
    
    // Check if search is working (results update or "no meals found" message)
    await expect(
      page.getByText(/no meals found/i).or(page.getByText(/showing/i))
    ).toBeVisible();
  });

  test('should handle offline state gracefully', async ({ page, context }) => {
    // Simulate offline state
    await context.setOffline(true);
    
    // Try to add a meal while offline
    await page.getByRole('button', { name: /add meal/i }).click();
    await page.getByLabelText(/food name/i).fill('Offline Test');
    await page.getByLabelText(/amount/i).fill('100g');
    await page.getByLabelText(/calories/i).fill('200');
    await page.getByLabelText(/protein/i).fill('20');
    
    await page.getByRole('button', { name: /add meal/i }).click();
    
    // Should show offline message or error
    await expect(
      page.getByText(/offline/i).or(page.getByText(/network error/i))
    ).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });

  test('should export meal history', async ({ page }) => {
    // Navigate to History tab
    await page.getByRole('tab', { name: /history/i }).click();
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export/i });
    
    if (await exportButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await exportButton.click();
      
      // Wait for download
      const download = await downloadPromise;
      
      // Check if file was downloaded
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });

  test('should handle image upload in meal entry', async ({ page }) => {
    // Open meal entry modal
    await page.getByRole('button', { name: /add meal/i }).click();
    
    // Check if image upload area is visible
    await expect(page.getByText(/click to add photo/i)).toBeVisible();
    
    // Create a test file
    const fileInput = page.getByRole('button', { name: /choose from gallery/i });
    
    // Upload a test image
    await fileInput.setInputFiles({
      name: 'test-meal.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    
    // Check if image preview is shown
    await expect(page.getByAltText(/meal preview/i)).toBeVisible();
    
    // Check if remove button is available
    await expect(page.getByRole('button', { name: /remove/i })).toBeVisible();
  });

  test('should persist user preferences', async ({ page }) => {
    // Set dark mode
    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    
    // Update daily goals
    await page.getByRole('tab', { name: /settings/i }).click();
    await page.getByLabelText(/daily calories goal/i).fill('2200');
    await page.getByRole('button', { name: /save goals/i }).click();
    
    // Reload the page
    await page.reload();
    
    // Check if preferences are persisted
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    await page.getByRole('tab', { name: /settings/i }).click();
    await expect(page.getByLabelText(/daily calories goal/i)).toHaveValue('2200');
  });
});
