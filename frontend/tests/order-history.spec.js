import { test, expect } from '@playwright/test';
import { createMockOrder } from './helpers/auth.js';

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function setupAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('admin_token', 'mock_jwt_token_admin');
    localStorage.setItem('admin_user', JSON.stringify({
      _id: 'admin123', name: 'Test Admin', email: 'admin@test.com', role: 'admin',
    }));
  });
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
// Component reads: response?.data?.data || response?.data
// axios wraps body in .data, so body must be { data: [...] }
// so that response.data.data resolves to the array.
//
// normalizeHistoryOrder() maps:
//   order.customerName → o.customer   (used in display + search)
//   order.totalAmount  → o.total
//   order._id / orderId → o.id / o._id

const HISTORY_ORDERS = [
  createMockOrder({ _id: '507f1f77bcf86cd799439020', status: 'picked_up', customerName: 'John Doe',    totalAmount: 250 }),
  createMockOrder({ _id: '507f1f77bcf86cd799439021', status: 'delivered', customerName: 'Jane Smith',  totalAmount: 180 }),
  createMockOrder({ _id: '507f1f77bcf86cd799439022', status: 'delivered', customerName: 'Bob Johnson', totalAmount: 320 }),
  createMockOrder({ _id: '507f1f77bcf86cd799439023', status: 'cancelled', customerName: 'Alice Brown', totalAmount: 150 }),
];

async function mockHistoryRoute(page, orders = HISTORY_ORDERS) {
  await page.route('**/api/orders/history*', (route) => {
    // Wrap in { data: [...] } — component reads response.data.data
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: orders }),
    });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Order History Page', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await mockHistoryRoute(page);

    // App.jsx route is /history not /admin/history
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => document.querySelector('tbody') !== null, { timeout: 15_000 });
    await page.waitForTimeout(300);
  });

  // 1 ── Completed orders visible ────────────────────────────────────────────
  test('should display completed orders in the table', async ({ page }) => {
    await expect(page.locator('tbody tr')).toHaveCount(4);
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('Alice Brown')).toBeVisible();
  });

  // 2 ── Summary cards ────────────────────────────────────────────────────────
  test('should display summary cards with correct labels', async ({ page }) => {
    // Use .first() or exact: true to avoid strict mode violations
    await expect(page.getByText('Total Orders', { exact: true })).toBeVisible();
    await expect(page.getByText('Completed Orders', { exact: true })).toBeVisible();
    await expect(page.getByText('Cancelled Orders', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Revenue', { exact: true })).toBeVisible();
  });

  // 3 ── Search by customer name ─────────────────────────────────────────────
  // Search is CLIENT-SIDE: filters normalised o.customer field.
  // Use exact placeholder to avoid matching sidebar "Search..." input.
  test('should filter orders by customer name using search', async ({ page }) => {
    await page.getByPlaceholder('Search by name, Order ID...').fill('Jane Smith');
    await page.waitForTimeout(400);
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  // 4 ── Clear search restores all rows ─────────────────────────────────────
  test('should restore all orders when search is cleared', async ({ page }) => {
    await page.getByPlaceholder('Search by name, Order ID...').fill('Jane');
    await page.waitForTimeout(400);
    await expect(page.locator('tbody tr')).toHaveCount(1);

    await page.getByPlaceholder('Search by name, Order ID...').clear();
    await page.waitForTimeout(400);
    await expect(page.locator('tbody tr')).toHaveCount(4);
  });

  // 5 ── Pagination controls ─────────────────────────────────────────────────
  // Pagination bar renders when paginatedOrders.length > 0.
  // With 4 orders (< 10 per page) there is 1 page → Previous is disabled.
  test('should show pagination bar and disable Previous button on first page', async ({ page }) => {
    const prevButton = page.getByRole('button', { name: 'Previous' });
    await expect(prevButton).toBeVisible();
    expect(await prevButton.isDisabled()).toBeTruthy();
  });

});