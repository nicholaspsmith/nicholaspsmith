import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:4321',
    channel: process.env.CI ? undefined : 'chrome',
  },
  webServer: {
    command: 'npm run build && npx wrangler dev --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
