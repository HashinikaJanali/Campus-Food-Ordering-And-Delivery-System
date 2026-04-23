// @ts-check
import { test, expect } from '@playwright/test';

const STUDENT_EMAIL    = 'user@campus.edu';
const STUDENT_PASSWORD = 'user123';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL    || 'admin@campus.edu';
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD || 'admin123';
const BASE_URL         = 'http://127.0.0.1:5173';

const TEST_CARD = {
  number: '4242 4242 4242 4242',
  name:   'Test Student',
  expiry: '12/28',
  cvv:    '123',
};

/**
 * @param {import('@playwright/test').Page} page
 */
async function loginAsStudent(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('button', { name: /student/i }).click();
  await page.locator('input[name="email"]').fill(STUDENT_EMAIL);
  await page.locator('input[name="password"]').fill(STUDENT_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('button', { name: /admin/i }).click();
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
 */
async function addFirstItemToCart(page) {
  await page.goto(`${BASE_URL}/`);
  const addBtn = page.locator(
    'button:has-text("Add"), button[aria-label*="add"], button:has-text("+")'
  ).first();
  if ((await addBtn.count()) === 0) return false;
  await addBtn.click();
  return true;
}

// PM-01: Checkout page renders
test('PM-01: Checkout page is accessible after adding an item to cart', async ({ page }) => {
  await loginAsStudent(page);
  const added = await addFirstItemToCart(page);
  test.skip(!added, 'No food items available in the menu – skipping');
  await page.goto(`${BASE_URL}/checkout`);
  await expect(
    page.getByText('Pickup Information', { exact: false })
  ).toBeVisible({ timeout: 8_000 });
  await expect(page.getByRole('button', { name: /on-campus/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /off-campus/i })).toBeVisible();
});

// PM-02: On-campus enables "Review Order" button
test('PM-02: On-campus selection enables the "Review Order" button', async ({ page }) => {
  await loginAsStudent(page);
  const added = await addFirstItemToCart(page);
  test.skip(!added, 'No food items available – skipping');
  await page.goto(`${BASE_URL}/checkout`);
  await page.getByRole('button', { name: /on-campus/i }).click();
  const nextBtn = page.getByRole('button', { name: /review order/i });
  await expect(nextBtn).toBeEnabled({ timeout: 5_000 });
});

// PM-03: Valid card shows "Valid" badge
test('PM-03: Payment form shows a "Valid" badge for the Stripe test card', async ({ page }) => {
  await loginAsStudent(page);
  const added = await addFirstItemToCart(page);
  test.skip(!added, 'No food items available – skipping');
  await page.goto(`${BASE_URL}/checkout`);
  await page.getByRole('button', { name: /on-campus/i }).click();
  await page.getByRole('button', { name: /review order/i }).click();
  await page.getByRole('button', { name: /proceed to payment/i }).click();
  await expect(
    page.getByText('Payment Details', { exact: false })
  ).toBeVisible({ timeout: 8_000 });
  await page.locator('input[name="cardNumber"]').fill(TEST_CARD.number);
  await expect(page.locator('text=Valid').first()).toBeVisible({ timeout: 5_000 });
});

// PM-04: Pay button disabled when card fields empty
test('PM-04: Pay button is disabled when card fields are empty', async ({ page }) => {
  await loginAsStudent(page);
  const added = await addFirstItemToCart(page);
  test.skip(!added, 'No food items available – skipping');
  await page.goto(`${BASE_URL}/checkout`);
  await page.getByRole('button', { name: /on-campus/i }).click();
  await page.getByRole('button', { name: /review order/i }).click();
  await page.getByRole('button', { name: /proceed to payment/i }).click();
  await expect(
    page.getByText('Payment Details', { exact: false })
  ).toBeVisible({ timeout: 8_000 });
  const payBtn = page.getByRole('button', { name: /pay rs\./i });
  await expect(payBtn).toBeDisabled();
});

// PM-05: Admin payments panel loads
test('PM-05: Admin payments panel displays transaction data', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`${BASE_URL}/admin/payments`);
  await expect(
    page.getByRole('heading', { name: 'Payments' })
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByRole('paragraph').filter({ hasText: 'Total Payments' })
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /csv/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /pdf report/i })).toBeVisible();
});