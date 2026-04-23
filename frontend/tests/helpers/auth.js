/**
 * Authentication helpers for Playwright tests
 */

/**
 * Setup admin authentication BEFORE navigation
 * Uses addInitScript to inject localStorage before page loads
 * @param {import('@playwright/test').Page} page
 * @param {string} token - JWT token (optional)
 */
export async function setupAdminAuth(page, token = 'mock_jwt_token_admin') {
  // Use addInitScript to set token before any page navigation
  await page.addInitScript((t) => {
    localStorage.setItem('admin_token', t);
  }, token);
}

/**
 * Setup delivery staff authentication BEFORE navigation
 * Uses addInitScript to inject localStorage before page loads
 * @param {import('@playwright/test').Page} page
 * @param {string} staffName - Delivery staff name (optional)
 */
export async function setupDeliveryAuth(page, staffName = 'John Smith') {
  // Use addInitScript to set staff name before any page navigation
  await page.addInitScript((name) => {
    localStorage.setItem('delivery_staff_name', name);
  }, staffName);
}

/**
 * Admin login helper
 * @param {import('@playwright/test').Page} page
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
export async function adminLogin(page, email = 'admin@example.com', password = 'password123') {
  await page.goto('/admin/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  
  // Mock the login API response
  await page.route('**/api/auth/admin/login', (route) => {
    route.abort('blockedbyclient');
  });
  
  await page.getByRole('button', { name: /login|sign in/i }).click();
  
  // Store JWT token in localStorage
  const adminToken = 'mock_jwt_token_' + Date.now();
  await page.evaluate((token) => {
    localStorage.setItem('admin_token', token);
  }, adminToken);
  
  // Wait for navigation to complete
  await page.waitForURL('**/admin/**');
}

/**
 * Set delivery staff name in localStorage (call after page navigation)
 * @param {import('@playwright/test').Page} page
 * @param {string} staffName - Delivery staff name
 */
export async function setDeliveryStaff(page, staffName = 'John Smith') {
  // First navigate to a page to ensure window context exists
  await page.goto('/');
  
  // Now set the delivery staff name
  await page.evaluate((name) => {
    localStorage.setItem('delivery_staff_name', name);
  }, staffName);
}

/**
 * Set admin token in localStorage (call after page navigation)
 * @param {import('@playwright/test').Page} page
 * @param {string} token - JWT token
 */
export async function setAdminToken(page, token = 'mock_jwt_token') {
  // First navigate to a page to ensure window context exists
  await page.goto('/');
  
  // Now set the token
  await page.evaluate((t) => {
    localStorage.setItem('admin_token', t);
  }, token);
}

/**
 * Clear all auth data from localStorage (call after page navigation)
 * @param {import('@playwright/test').Page} page
 */
export async function clearAuth(page) {
  // Navigate to a page to ensure window context exists
  await page.goto('/');
  
  await page.evaluate(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('delivery_staff_name');
  });
}

/**
 * Mock order API responses for testing
 * @param {import('@playwright/test').Page} page
 * @param {Array} orders - Array of order objects
 */
export async function mockOrdersAPI(page, orders = []) {
  await page.route('**/api/orders*', (route) => {
    route.resolve({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, orders }),
    });
  });
}

/**
 * Create a mock order object
 * @param {Partial} overrides - Override properties
 */
export function createMockOrder(overrides = {}) {
  const baseId = '507f1f77bcf86cd799439011';
  return {
    _id: baseId,
    orderId: `#ORD-${baseId.slice(-6).toUpperCase()}`,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { name: 'Burger', quantity: 2, price: 100 },
    ],
    totalAmount: 200,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryAddress: '123 Main St',
    phone: '+1234567890',
    ...overrides,
  };
}
