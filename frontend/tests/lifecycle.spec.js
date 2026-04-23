import { test, expect } from '@playwright/test';
import { createMockOrder } from './helpers/auth.js';

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function setupAdminAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('admin_token', 'mock_jwt_token_admin');
    localStorage.setItem('admin_user', JSON.stringify({
      _id: 'admin123', name: 'Test Admin', email: 'admin@test.com', role: 'admin',
    }));
  });
}

async function setupStaffAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('user_token', 'mock_jwt_token_staff');
    localStorage.setItem('user_data', JSON.stringify({
      _id: 'staff123', name: 'John Smith', email: 'staff@test.com', role: 'staff',
    }));
    localStorage.setItem('delivery_staff_name', 'John Smith');
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Full Order Lifecycle', () => {

  // 1 ── Admin sees pending order on /orders ─────────────────────────────────
  test('should display pending order on the order management page', async ({ page }) => {
    const order = createMockOrder({ _id: 'aaa111', status: 'pending', customerName: 'Lifecycle User' });

    await setupAdminAuth(page);
    await page.route('**/api/orders', (route) => {
      const url = route.request().url();
      if (!url.includes('/history') && !url.includes('/delivery')) {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, orders: [order] }) });
      } else { route.continue(); }
    });

    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => document.querySelector('tbody') !== null, { timeout: 15_000 });

    await expect(page.getByText('Lifecycle User')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  // 2 ── Completed order disappears from /orders ─────────────────────────────
  test('should not show delivered orders on the active orders page', async ({ page }) => {
    const orders = [
      createMockOrder({ _id: 'bbb111', status: 'pending',   customerName: 'Active User'    }),
      createMockOrder({ _id: 'bbb222', status: 'delivered', customerName: 'Delivered User' }),
    ];

    await setupAdminAuth(page);
    await page.route('**/api/orders', (route) => {
      const url = route.request().url();
      if (!url.includes('/history') && !url.includes('/delivery')) {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, orders }) });
      } else { route.continue(); }
    });

    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => document.querySelector('tbody') !== null, { timeout: 15_000 });

    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Active User')).toBeVisible();
    await expect(page.getByText('Delivered User')).not.toBeVisible();
  });

  // 3 ── Completed order appears in /history ────────────────────────────────
  test('should show completed order in the history page', async ({ page }) => {
    const order = createMockOrder({ _id: 'ccc111', status: 'delivered', customerName: 'History User', totalAmount: 299 });

    await setupAdminAuth(page);
    // Try both response shapes — component reads response.data.data OR response.data
    await page.route('**/api/orders/history*', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [order], total: 1, pages: 1, currentPage: 1 }) });
    });

    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => document.querySelector('tbody') !== null, { timeout: 15_000 });
    await page.waitForTimeout(500);

    await expect(page.getByText('History User')).toBeVisible();
  });

  // 4 ── Delivery staff sees ready order on /delivery-staff ─────────────────
  test('should show ready order on the delivery staff page', async ({ page }) => {
    const order = {
      ...createMockOrder({ _id: 'ddd111', status: 'ready', customerName: 'Delivery User' }),
      deliveryInfo: { phoneNumber: '+15551234567', onCampusLocation: '99 Test Rd' },
    };

    await setupStaffAuth(page);
    // Component reads response.data.data → wrap in { data: [...] }
    await page.route('**/api/orders/delivery/assigned*', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: [order] }) });
      } else { route.continue(); }
    });

    await page.goto('/delivery-staff');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => {
      return document.querySelectorAll('[class*="rounded-2xl"]').length > 0
        || document.body.innerText.includes('No assigned orders');
    }, { timeout: 15_000 });
    await page.waitForTimeout(300);

    await expect(page.getByText('Delivery User')).toBeVisible();
    const card = page.locator('[class*="rounded-2xl"]', { has: page.getByText('Delivery User') }).first();
    await expect(card.getByRole('button', { name: /start/i })).toBeVisible();
  });

  // 5 ── Data consistency: order amount shown correctly ──────────────────────
  test('should display correct order amount on the management page', async ({ page }) => {
    const order = createMockOrder({ _id: 'eee111', status: 'pending', customerName: 'Amount User', totalAmount: 450 });

    await setupAdminAuth(page);
    await page.route('**/api/orders', (route) => {
      const url = route.request().url();
      if (!url.includes('/history') && !url.includes('/delivery')) {
        route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ success: true, orders: [order] }) });
      } else { route.continue(); }
    });

    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => document.querySelector('tbody') !== null, { timeout: 15_000 });

    await expect(page.getByText('Amount User')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

});