import { test, expect } from '@playwright/test';
import { createMockOrder } from './helpers/auth.js';

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
// App.jsx's ProtectedRoute checks: const { admin } = useAuth()
// AuthContext reads: localStorage.getItem('admin_token') + 'admin_user'
// Both keys must be set via addInitScript (runs before React boots).

async function setupAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('admin_token', 'mock_jwt_token_admin');
    localStorage.setItem('admin_user', JSON.stringify({
      _id: 'admin123',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
    }));
  });
}

// ---------------------------------------------------------------------------
// Route mock helper
// ---------------------------------------------------------------------------

async function mockOrdersRoute(page, orders) {
  await page.route('**/api/orders', (route) => {
    const url = route.request().url();
    if (!url.includes('/history') && !url.includes('/delivery')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, orders }),
      });
    } else {
      route.continue();
    }
  });
}

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const BASE_ORDERS = [
  createMockOrder({ _id: '507f1f77bcf86cd799439011', status: 'pending',   customerName: 'Alice Johnson' }),
  createMockOrder({ _id: '507f1f77bcf86cd799439012', status: 'preparing', customerName: 'Bob Smith'     }),
  createMockOrder({ _id: '507f1f77bcf86cd799439013', status: 'ready',     customerName: 'Carol White'   }),
  // Final-status — filtered out by isFinalStatus()
  createMockOrder({ _id: '507f1f77bcf86cd799439014', status: 'picked_up', customerName: 'David Brown'   }),
  createMockOrder({ _id: '507f1f77bcf86cd799439015', status: 'cancelled', customerName: 'Eve Davis'     }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Order Management Page', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Inject auth before React boots
    await setupAuth(page);

    // 2. Mock the orders API
    await mockOrdersRoute(page, BASE_ORDERS);

    // 3. Navigate to the correct path — App.jsx defines it as '/orders', not '/admin/orders'
    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');

    // 4. Wait for either the table OR the loading spinner to disappear.
    //    The component shows a spinner while loading=true, then renders <tbody>.
    await page.waitForFunction(() => {
      // tbody exists AND has at least one tr, OR has the empty-state tr
      const tbody = document.querySelector('tbody');
      return tbody !== null;
    }, { timeout: 15_000 });

    await page.waitForTimeout(300);
  });

  // 1 ── Active-only display ────────────────────────────────────────────────
  test('should display only active orders and hide completed ones', async ({ page }) => {
    // isFinalStatus() filters picked_up & cancelled → 3 active rows remain
    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByText('David Brown')).not.toBeVisible();
    await expect(page.getByText('Eve Davis')).not.toBeVisible();
  });

  // 2 ── Summary card counts ────────────────────────────────────────────────
  test('should display correct counts in summary cards', async ({ page }) => {
    // Cards: Total Orders=3, Pending Orders=1, Ready Orders=1
    const boldNumbers = page.locator('p.text-3xl.font-bold');
    const texts = await boldNumbers.allTextContents();
    expect(texts.some(t => t.trim() === '3')).toBe(true);
    expect(texts.some(t => t.trim() === '1')).toBe(true);
  });

  // 3 ── Search by customer name ────────────────────────────────────────────
  test('should filter rows by customer name using search', async ({ page }) => {
    // Two search inputs exist (sidebar + table). Target the table one specifically.
    await page.getByPlaceholder('Search by name, Order ID...').fill('Alice');
    await page.waitForTimeout(400);
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Alice Johnson')).toBeVisible();
  });

  // 4 ── Status filter pill ─────────────────────────────────────────────────
  test('should filter orders by status when a filter pill is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Alice Johnson')).toBeVisible();

    await page.getByRole('button', { name: 'All Active' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(3);
  });

  // 5 ── Empty state ─────────────────────────────────────────────────────────
  test('should show empty state when no orders match the search', async ({ page }) => {
    await page.getByPlaceholder('Search by name, Order ID...').fill('ZZZNOMATCH999');
    await page.waitForTimeout(400);
    await expect(page.getByText(/no orders found/i)).toBeVisible();
  });

  // 6 ── Details navigation ──────────────────────────────────────────────────
  test('should navigate to order detail page when Details is clicked', async ({ page }) => {
    // Component: navigate(`/order/${orderDbId}`)
    await page.getByRole('button', { name: 'Details' }).first().click();
    await expect(page).toHaveURL(/\/order\//);
  });

});