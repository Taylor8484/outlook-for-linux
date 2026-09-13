import { test, expect } from '@playwright/test';
import { launchAuthenticatedApp, waitForAppWindow, closeApp } from './helpers.js';

test.describe('Authenticated app launch', () => {
  let electronApp;

  test.afterEach(async () => {
    await closeApp(electronApp);
  });

  test('app loads Outlook without redirecting to login', async ({}, testInfo) => {
    const sessionDir = testInfo.project.use.sessionDir;
    electronApp = await launchAuthenticatedApp(sessionDir);

    const mainWindow = await waitForAppWindow(electronApp);
    expect(mainWindow, 'Main Outlook window should exist').toBeTruthy();

    const url = mainWindow.url();
    const hostname = new URL(url).hostname;

    // Should be on an Outlook domain, NOT on the login page
    expect(hostname).not.toBe('login.microsoftonline.com');
    expect(
      ['outlook.office.com', 'outlook.office365.com', 'outlook.cloud.microsoft', 'outlook.live.com']
    ).toContain(hostname);
  });

  test('Outlook UI loads to a usable state', async ({}, testInfo) => {
    const sessionDir = testInfo.project.use.sessionDir;
    electronApp = await launchAuthenticatedApp(sessionDir);

    const mainWindow = await waitForAppWindow(electronApp);
    expect(mainWindow).toBeTruthy();

    // The web app keeps long-lived connections open so networkidle never
    // triggers. Use domcontentloaded instead.
    await mainWindow.waitForLoadState('domcontentloaded', { timeout: 60000 });

    // Verify no crash errors in the page
    const crashIndicators = await mainWindow.locator('text=/something went wrong/i').count();
    expect(crashIndicators, 'No crash indicators should be visible').toBe(0);
  });
});
