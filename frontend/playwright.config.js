import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // ✅ FIX 1: Use 127.0.0.1 to match Vite's actual server address.
    // Using 'localhost' can fail because route mocks won't intercept
    // requests going to 127.0.0.1 (they're treated as different origins).
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    // ✅ FIX 2: webServer url must also match 127.0.0.1
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  timeout: 30 * 1000,
  expect: { timeout: 5000 },
});