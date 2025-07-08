import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app to ensure it's running
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    
    // Wait for the app to be fully loaded
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 30000 }).catch(() => {
      // If no specific app-loaded indicator, wait for main content
      return page.waitForSelector('h1', { timeout: 30000 });
    });

    console.log('✅ App is running and accessible');

    // Clear any existing data in localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Set up test data if needed
    await page.evaluate(() => {
      // Set default daily goals for consistent testing
      localStorage.setItem('dailyGoals', JSON.stringify({
        calories: 2000,
        protein: 150
      }));

      // Set theme preference
      localStorage.setItem('nutrition-tracker-theme', 'light');

      // Set language preference
      localStorage.setItem('nutrition-tracker-language', 'en');

      // Disable notifications for testing
      localStorage.setItem('notifications-enabled', 'false');
    });

    console.log('✅ Test environment prepared');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎯 Global setup completed successfully');
}

export default globalSetup;
