const { defineConfig } = require('@playwright/test');

// Session directories contain live Microsoft auth tokens. Never commit session
// data or use a path inside the repository.
if (!process.env.E2E_SESSION_DIR) {
  throw new Error(
    'E2E_SESSION_DIR must be set to a directory outside the repository containing a ' +
    'logged-in session. Create one by running the app with ' +
    'E2E_USER_DATA_DIR=<dir> npm start and signing in, then pass the same <dir>.'
  );
}

module.exports = defineConfig({
  testDir: './tests/e2e/authenticated',
  timeout: 90000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
    sessionDir: process.env.E2E_SESSION_DIR,
  },
});
