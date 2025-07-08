import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  try {
    // Clean up any test artifacts
    console.log('✅ Cleaning up test artifacts...');

    // If you have any external services or databases to clean up, do it here
    // For example:
    // - Clear test database
    // - Reset external API states
    // - Clean up uploaded files

    console.log('✅ Test artifacts cleaned up');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }

  console.log('🏁 Global teardown completed');
}

export default globalTeardown;
