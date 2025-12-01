import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Playwright Configuration for Cubetive E2E Tests
 *
 * Features:
 * - Chromium/Desktop Chrome only (per guidelines)
 * - Authenticated session reuse via storage state
 * - Global teardown to clean test database after all tests
 * - Automatic dev server startup
 * - Screenshot/trace on failure
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Global teardown - runs after ALL tests complete
  globalTeardown: './e2e/global-teardown.ts',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project - runs once before all tests
    // Creates authenticated session and saves to storage state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main test project - uses authenticated session
    // Excludes public tests (those run in chromium-public project)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load authenticated session from setup
        storageState: 'e2e/.auth/user.json',
      },
      testIgnore: /.*\.public\.spec\.ts/,
      dependencies: ['setup'],
    },

    // Public tests - no authentication needed
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.public\.spec\.ts/,
    },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
