import { test, expect } from '@playwright/test';
import { loginAsStudent } from './auth.helpers';
import { chromium } from '@playwright/test';

async function resetTestEnvironment() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (e) {}
  await browser.close();
}

test.beforeAll(async () => {
  await resetTestEnvironment();
});

test.describe('Mini-Games', () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/feedback');
    await page.waitForLoadState('networkidle');
    
    // Navigate directly to mini-games tab using query param
    await page.goto('/feedback?tab=mini-games');
    await page.waitForLoadState('networkidle');
  });

  test('should display mini-games tab', async ({ page }) => {
    await expect(page.getByText(/Play games, earn real points/i)).toBeVisible();
  });

  test('should show available games', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Spin the Wheel/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Scratch Card/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Food Quiz/i })).toBeVisible();
  });

  test('should open spin wheel game', async ({ page }) => {
    // Wait for heading and click
    const heading = page.getByRole('heading', { name: /Spin the Wheel/i }).first();
    await heading.scrollIntoViewIfNeeded();
    await heading.click({ force: true });
    
    // Verify modal
    await expect(page.getByRole('heading', { name: /Spin the Wheel!/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /SPIN NOW/i })).toBeVisible();
  });

  test('should show points won today', async ({ page }) => {
    await expect(page.getByText(/Points Won Today/i)).toBeVisible();
    await expect(page.getByText(/Your Total Points/i)).toBeVisible();
  });
});