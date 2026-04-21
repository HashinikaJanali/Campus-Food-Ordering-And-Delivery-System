import { test, expect } from '@playwright/test';

test.describe('Inventory Management System', () => {
  // Use a unique ID for this test run to prevent name collisions
  const testId = Date.now().toString().slice(-6);
  const canteenName = `Auto Canteen ${testId}`;
  const categoryName = `Auto Category ${testId}`;
  const foodItemName = `Auto Item ${testId}`;
  
  let adminSession = null;

  // 1. Setup: Perform API login once for the entire test suite
  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    const response = await request.post('http://127.0.0.1:5001/api/auth/login', {
      data: { email: 'admin@campus.edu', password: 'admin123' }
    });
    if (response.ok()) {
      adminSession = await response.json();
    }
    await request.dispose();
  });

  test.beforeEach(async ({ page }) => {
    // Inject auth session directly into localStorage before each test
    if (adminSession) {
      await page.goto('/'); 
      await page.evaluate((session) => {
        localStorage.setItem('admin_token', session.token);
        localStorage.setItem('admin_user', JSON.stringify(session.admin));
      }, adminSession);
    }
    // Most tests start from the admin dashboard
    await page.goto('/admin/dashboard');
  });

  test.describe('Administrative Management', () => {
    
    test('Canteen Administration: Should support full Create, Read, Update, and Delete lifecycle', async ({ page }) => {
      await page.goto('/admin/canteens');
      
      // Create
      await page.getByRole('button', { name: /Add Canteen/i }).click();
      await page.getByPlaceholder(/e.g., P&S Canteen/i).fill(canteenName);
      await page.getByPlaceholder(/e.g., Near New Building/i).fill('Test Location');
      await page.getByRole('button', { name: /Create/i }).click();
      
      await expect(page.getByText(/Canteen created!/i)).toBeVisible();
      await expect(page.getByText(canteenName)).toBeVisible();

      // Edit
      await page.locator('.group').filter({ hasText: canteenName }).getByRole('button').first().click();
      const updatedName = `${canteenName} (Updated)`;
      await page.getByPlaceholder(/e.g., P&S Canteen/i).fill(updatedName);
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByText(/Canteen updated!/i)).toBeVisible();
      await expect(page.getByText(updatedName)).toBeVisible();

      // Delete
      await page.locator('.group').filter({ hasText: updatedName }).getByRole('button').nth(1).click();
      await page.locator('div.fixed').getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText(/Canteen deleted/i)).toBeVisible();
    });

    test('Category Administration: Should allow managing food categories with icons', async ({ page }) => {
      await page.goto('/admin/categories');

      // Create
      await page.getByRole('button', { name: /Add Category/i }).click();
      await page.getByPlaceholder(/e.g., Beverages/i).fill(categoryName);
      await page.getByPlaceholder('Brief description').fill('Category for testing');
      await page.getByRole('button', { name: '🍕' }).click(); 
      await page.getByRole('button', { name: /Create/i }).click();

      await expect(page.getByText(/Category created!/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(categoryName).first()).toBeVisible();

      // Edit
      await page.locator('.group').filter({ hasText: categoryName }).getByRole('button').first().click();
      const updatedCat = `${categoryName} (U)`;
      await page.getByPlaceholder(/e.g., Beverages/i).fill(updatedCat);
      await page.getByRole('button', { name: /Update/i }).click();
      await expect(page.getByText(/Category updated!/i)).toBeVisible();
      await expect(page.getByText(updatedCat).first()).toBeVisible();

      // Delete
      await page.locator('.group').filter({ hasText: updatedCat }).getByRole('button').nth(1).click();
      await page.locator('div.fixed').getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText(/Category deleted/i)).toBeVisible();
    });

    test('Food Item Administration: Should handle item creation and price updates', async ({ page }) => {
      await page.goto('/admin/food-items');

      // Create
      await page.getByRole('button', { name: /Add Item/i }).click();
      await page.locator('input[name="name"]').fill(foodItemName);
      await page.locator('input[name="price"]').fill('450');
      await page.locator('select[name="category"]').selectOption({ label: '🍛 Rice & Curry' });
      await page.locator('select[name="canteen"]').selectOption({ label: 'P&S' });
      await page.locator('input[name="stockQuantity"]').fill('10');
      await page.locator('input[name="lowStockThreshold"]').fill('5');
      await page.locator('textarea[name="description"]').fill('Delicious automated item');
      await page.getByRole('button', { name: /Create Item/i }).click();

      await expect(page.getByText(/Food item created!/i)).toBeVisible();
      await expect(page.getByText(foodItemName).first()).toBeVisible();

      // Edit
      await page.locator('.group').filter({ hasText: foodItemName }).getByTitle('Edit').click();
      await page.getByPlaceholder('0.00').fill('500');
      await page.getByRole('button', { name: /Update Item/i }).click();
      await expect(page.getByText(/Food item updated!/i)).toBeVisible();
      await expect(page.getByText('Rs. 500.00').first()).toBeVisible();

      // Delete
      await page.locator('.group').filter({ hasText: foodItemName }).getByTitle('Delete').click();
      await page.locator('div.fixed').getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByText(/Food item deleted/i)).toBeVisible();
    });

    test('Validation: Item creation form should enforce required fields and positive values', async ({ page }) => {
      await page.goto('/admin/food-items');
      await page.getByRole('button', { name: /Add Item/i }).click();
      
      // Submit empty form
      await page.getByRole('button', { name: /Create Item/i }).click();
      
      await expect(page.getByText(/Food item name is required/i)).toBeVisible();
      await expect(page.getByText(/Price is required/i)).toBeVisible();
      await expect(page.getByText(/Please select a category/i)).toBeVisible();
      await expect(page.getByText(/Please select a canteen/i)).toBeVisible();

      // Invalid numeric values
      await page.locator('input[name="name"]').fill('Validation Test');
      await page.locator('input[name="price"]').fill('-10');
      await page.locator('input[name="stockQuantity"]').fill('-5');
      
      await page.getByRole('button', { name: /Create Item/i }).click();

      await expect(page.getByText(/Price must be a valid number/i)).toBeVisible();
      await expect(page.getByText(/Stock quantity cannot be negative/i)).toBeVisible();
    });
  });

  test.describe('Inventory Control & Alerts', () => {

    test('Inventory Control: Should allow quick stock adjustments and quantity setting', async ({ page }) => {
      await page.goto('/admin/inventory');

      const firstItem = page.locator('.animate-fade-in').first();
      await expect(firstItem).toBeVisible();
      
      await firstItem.getByRole('button', { name: /Update/i }).click();
      await firstItem.getByRole('button', { name: '+50' }).click();
      await expect(page.getByText(/Added 50 units/i)).toBeVisible();
      
      await firstItem.getByRole('combobox').selectOption('set');
      await firstItem.getByPlaceholder('Qty').fill('100');
      await firstItem.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText(/Stock updated!/i)).toBeVisible();
      await expect(firstItem.getByText('100').first()).toBeVisible();
    });

    test('Alerts System: Should allow viewing and resolving stock alerts', async ({ page }) => {
      await page.goto('/admin/alerts');
      
      if (await page.locator('.animate-fade-in').count() > 0) {
        const firstAlert = page.locator('.animate-fade-in').first();
        await firstAlert.getByTitle(/Mark as read/i).click();
        await firstAlert.getByTitle(/Mark as resolved/i).click();
        await expect(page.getByText(/Alert resolved/i)).toBeVisible();
      }
    });

    test('Stock Alerts: Should transition status correctly from Low to Out to Restocked', async ({ page }) => {
      const alertItemName = `Alert Item ${testId}`;
      
      // 1. Create item with threshold 10
      await page.goto('/admin/food-items');
      await page.getByRole('button', { name: /Add Item/i }).click();
      await page.getByPlaceholder(/e.g., Chicken Burger/i).fill(alertItemName);
      await page.getByPlaceholder('0.00').fill('100');
      
      const categorySelect = page.locator('select[name="category"]');
      await expect(async () => {
        expect(await categorySelect.locator('option').count()).toBeGreaterThan(1);
      }).toPass();
      const catOption = categorySelect.locator('option').filter({ hasText: /Short Eats|Rice & Curry/i }).first();
      await categorySelect.selectOption(await catOption.getAttribute('value'));
      
      const canteenSelect = page.locator('select[name="canteen"]');
      await expect(async () => {
        expect(await canteenSelect.locator('option').count()).toBeGreaterThan(1);
      }).toPass();
      const canteenOption = canteenSelect.locator('option').filter({ hasText: /P&S|Near/i }).first();
      await canteenSelect.selectOption(await canteenOption.getAttribute('value'));
      
      await page.locator('input[name="stockQuantity"]').fill('15'); 
      await page.locator('input[name="lowStockThreshold"]').fill('10');
      await page.getByRole('button', { name: /Create Item/i }).click();
      await expect(page.getByText(/Food item created!/i)).toBeVisible();

      // 2. Trigger Low Stock (Set to 5)
      await page.goto('/admin/inventory');
      const itemRow = page.locator('.animate-fade-in').filter({ hasText: alertItemName });
      await itemRow.getByRole('button', { name: /Update/i }).click();
      await itemRow.getByRole('combobox').selectOption('set');
      await itemRow.getByPlaceholder('Qty').fill('5');
      await itemRow.getByRole('button', { name: 'Update' }).click();
      await expect(page.getByText(/Stock updated!/i)).toBeVisible();

      // Verify Low Stock Alert
      await page.goto('/admin/alerts');
      await expect(page.getByText(new RegExp(`${alertItemName}.*LOW on stock`, 'i'))).toBeVisible();

      // 3. Trigger Out of Stock (Set to 0)
      await page.goto('/admin/inventory');
      await itemRow.getByRole('button', { name: /Update/i }).click();
      await itemRow.getByRole('combobox').selectOption('set');
      await itemRow.getByPlaceholder('Qty').fill('0');
      await itemRow.getByRole('button', { name: 'Update' }).click();

      // Verify Out of Stock Alert
      await page.goto('/admin/alerts');
      await expect(page.getByText(new RegExp(`${alertItemName}.*OUT OF STOCK`, 'i'))).toBeVisible();

      // 4. Trigger Restocked (Set to 20)
      await page.goto('/admin/inventory');
      await itemRow.getByRole('button', { name: /Update/i }).click();
      await itemRow.getByRole('combobox').selectOption('set');
      await itemRow.getByPlaceholder('Qty').fill('20');
      await itemRow.getByRole('button', { name: 'Update' }).click();

      // Verify Restocked Alert
      await page.goto('/admin/alerts');
      await expect(page.getByText(new RegExp(`${alertItemName}.*has been restocked`, 'i'))).toBeVisible();
    });
  });

  test.describe('Student Experience & Synchronization', () => {

    test('Analytics: Should display data visualizations and support CSV/PDF exports', async ({ page }) => {
      await page.goto('/admin/analytics');
      await expect(page.getByText(/Total Items/i)).toBeVisible();
      await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Download PDF/i })).toBeVisible();
    });

    test('Public Menu: Should allow students to search and filter food items', async ({ page }) => {
      await page.goto('/menu');
      await page.getByPlaceholder('Search food items...').fill('Rice');
      await expect(page.locator('.animate-fade-in').first()).toBeVisible();
      
      const itemsCount = await page.locator('.animate-fade-in').count();
      if (itemsCount > 0) {
        await expect(page.locator('.animate-fade-in').first()).toBeVisible();
      }
    });

    test('Menu Visibility: Food items should appear/disappear based on visibility toggle', async ({ page }) => {
      const hiddenItemName = `Hidden Item ${testId}`;
      
      // Create item
      await page.goto('/admin/food-items');
      await page.getByRole('button', { name: /Add Item/i }).click();
      await page.getByPlaceholder(/e.g., Chicken Burger/i).fill(hiddenItemName);
      await page.getByPlaceholder('0.00').fill('100');
      await page.locator('select[name="category"]').selectOption({ index: 1 });
      await page.locator('select[name="canteen"]').selectOption({ index: 1 });
      await page.getByRole('button', { name: /Create Item/i }).click();
      
      // Toggle Visibility OFF
      const itemCard = page.locator('.animate-fade-in').filter({ hasText: hiddenItemName });
      await itemCard.getByTitle(/Hide from menu/i).click();
      await expect(itemCard.getByText('Hidden')).toBeVisible();

      // Check Student Menu
      await page.goto('/menu');
      await page.getByPlaceholder('Search food items...').fill(hiddenItemName);
      await expect(page.getByText(/No items found/i)).toBeVisible();

      // Toggle Visibility ON
      await page.goto('/admin/food-items');
      await itemCard.getByTitle(/Show on menu/i).click();

      // Check Student Menu again
      await page.goto('/menu');
      await page.getByPlaceholder('Search food items...').fill(hiddenItemName);
      await expect(page.getByText(hiddenItemName)).toBeVisible();
    });

    test('Synchronous Updates: Student menu should reflect real-time stock changes', async ({ page }) => {
      const syncItemName = `Sync Item ${testId}`;
      
      // 1. Create item with stock 1
      await page.goto('/admin/food-items');
      await page.getByRole('button', { name: /Add Item/i }).click();
      await page.locator('input[name="name"]').fill(syncItemName);
      await page.locator('input[name="price"]').fill('100');
      await page.locator('select[name="category"]').selectOption({ index: 1 });
      await page.locator('select[name="canteen"]').selectOption({ index: 1 });
      await page.locator('input[name="stockQuantity"]').fill('1'); 
      await page.getByRole('button', { name: /Create Item/i }).click();

      // 2. Check Student Menu
      await page.goto('/menu');
      await page.getByPlaceholder('Search food items...').fill(syncItemName);
      
      const foodCard = page.locator('.animate-fade-in').filter({ hasText: syncItemName });
      await expect(foodCard).toBeVisible();
      
      await expect(async () => {
        const text = await foodCard.innerText();
        expect(text).toMatch(/1 (in stock|left)/i);
      }).toPass();

      // 3. Add to cart - should trigger local stock update to 0
      await foodCard.getByRole('button', { name: /Add to Cart/i }).click();
      
      await expect(foodCard.getByText(/Sold Out/i)).toBeVisible();
      await expect(foodCard.getByRole('button', { name: /Add to Cart/i })).not.toBeVisible();
    });
  });

});
