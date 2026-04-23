import { test, expect } from '@playwright/test';
import { createMockOrder } from './helpers/auth.js';

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
// StaffProtectedRoute checks useUserAuth() → needs user_token + user_data{role:'staff'}

async function setupStaffAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('user_token', 'mock_jwt_token_staff');
    localStorage.setItem('user_data', JSON.stringify({
      _id: 'staff123',
      name: 'John Smith',
      email: 'staff@test.com',
      role: 'staff',
    }));
    localStorage.setItem('delivery_staff_name', 'John Smith');
  });
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
// Component reads: response?.data?.data OR response?.data
// axios wraps the response body in `.data`, so fulfill body must be the array
// directly OR { data: [...] }. The safest shape is { data: [...] } so that
// response.data.data resolves to the array.

const makeOrder = (overrides) => ({
  ...createMockOrder(overrides),
  // Component reads deliveryInfo.phoneNumber for the tel: link
  deliveryInfo: {
    phoneNumber: '+15551234567',
    onCampusLocation: overrides.deliveryAddress || '123 Main St',
  },
  ...overrides,
});

const ASSIGNED_ORDERS = [
  makeOrder({ _id: '507f1f77bcf86cd799439030', status: 'ready',     customerName: 'Alice Johnson', deliveryAddress: '123 Main St' }),
  makeOrder({ _id: '507f1f77bcf86cd799439031', status: 'delivering', customerName: 'Bob Smith',    deliveryAddress: '456 Oak Ave' }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Delivery Staff Page', () => {

  test.beforeEach(async ({ page }) => {
    await setupStaffAuth(page);

    // Component reads: response?.data?.data → wrap in { data: ASSIGNED_ORDERS }
    await page.route('**/api/orders/delivery/assigned*', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: ASSIGNED_ORDERS }),
        });
      } else {
        route.continue();
      }
    });

    await page.route('**/api/orders/*/status', (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/delivery-staff');
    await page.waitForLoadState('domcontentloaded');

    // Wait for orders to render OR empty state
    await page.waitForFunction(() => {
      return document.querySelectorAll('[class*="rounded-2xl"]').length > 0
        || document.body.innerText.includes('No assigned orders');
    }, { timeout: 15_000 });
    await page.waitForTimeout(300);
  });

  // 1 ── Orders visible ──────────────────────────────────────────────────────
  test('should display all assigned orders', async ({ page }) => {
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Bob Smith')).toBeVisible();
  });

  // 2 ── Start button only on ready orders ──────────────────────────────────
  test('should show Start button on ready orders and not on delivering orders', async ({ page }) => {
    const aliceCard = page.locator('[class*="rounded-2xl"]', { has: page.getByText('Alice Johnson') }).first();
    await expect(aliceCard.getByRole('button', { name: /start/i })).toBeVisible();

    const bobCard = page.locator('[class*="rounded-2xl"]', { has: page.getByText('Bob Smith') }).first();
    expect(await bobCard.getByRole('button', { name: /^start$/i }).isVisible().catch(() => false)).toBeFalsy();
  });

  // 3 ── Delivered button only on delivering orders ──────────────────────────
  test('should show Delivered button on delivering orders and not on ready orders', async ({ page }) => {
    const bobCard = page.locator('[class*="rounded-2xl"]', { has: page.getByText('Bob Smith') }).first();
    await expect(bobCard.getByRole('button', { name: /delivered/i })).toBeVisible();

    const aliceCard = page.locator('[class*="rounded-2xl"]', { has: page.getByText('Alice Johnson') }).first();
    expect(await aliceCard.getByRole('button', { name: /^delivered$/i }).isVisible().catch(() => false)).toBeFalsy();
  });

  // 4 ── Search by customer name ─────────────────────────────────────────────
  test('should filter orders by customer name using search', async ({ page }) => {
    // Exact placeholder from component: "Search by order id, customer, or location"
    await page.getByPlaceholder('Search by order id, customer, or location').fill('Alice');
    await page.waitForTimeout(500);
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    expect(await page.getByText('Bob Smith').isVisible().catch(() => false)).toBeFalsy();
  });

  // 5 ── Empty state ─────────────────────────────────────────────────────────
  test('should show empty state when no orders are assigned', async ({ page }) => {
    await page.route('**/api/orders/delivery/assigned*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/No assigned orders/i)).toBeVisible();
  });

  // 6 ── Phone link ──────────────────────────────────────────────────────────
  test('should render phone numbers as tel: links', async ({ page }) => {
    // Component renders: <a href={`tel:${order.deliveryInfo?.phoneNumber}`}>
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
    const href = await phoneLink.getAttribute('href');
    expect(href).toMatch(/^tel:/);
  });

});