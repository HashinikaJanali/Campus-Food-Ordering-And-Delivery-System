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


test.describe('Loyalty Points System', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    // Navigate directly to loyalty tab using query param
    await page.goto('/feedback?tab=loyalty');
    await page.waitForLoadState('networkidle');
  });

  test('should display loyalty points dashboard', async ({ page }) => {
    await expect(page.getByText('Your Total Points')).toBeVisible();
    await expect(page.getByText(/Member/i)).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/loyalty-dashboard.png' });
  });

  test('should show available rewards', async ({ page }) => {
    await expect(page.getByText(/Rs\..*Off/i).first()).toBeVisible();
    await expect(page.getByText(/Points/i).first()).toBeVisible();
  });

  test('should show points history', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Points History/i })).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/points-history.png' });
  });

  test('should attempt to redeem reward', async ({ page }) => {
    const redeemButton = page.getByRole('button', { name: /Redeem/i }).first();
    await expect(redeemButton).toBeVisible();
  });
});