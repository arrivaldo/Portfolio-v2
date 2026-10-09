import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  // Locally, many parallel Edge instances crash ("session closed") — cap the workers.
  workers: CI ? undefined : 2,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Locally, reuse the installed Edge instead of downloading browsers; CI installs Chromium.
    channel: CI ? undefined : 'msedge',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: CI ? undefined : 'msedge' } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: CI ? undefined : 'msedge' } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !CI,
  },
})
