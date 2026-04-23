// @ts-check
import { test, expect } from '@playwright/test';

const STUDENT_EMAIL    = 'user@campus.edu';
const STUDENT_PASSWORD = 'user123';
const ADMIN_EMAIL      = process.env.ADMIN_EMAIL    || 'admin@campus.edu';
const ADMIN_PASSWORD   = process.env.ADMIN_PASSWORD || 'admin123';
const BASE_URL         = 'http://127.0.0.1:5173';

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

// UM-01: Valid student login
test('UM-01: Student can log in with valid demo credentials', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('button', { name: /student/i }).click();
  await page.locator('input[name="email"]').fill(STUDENT_EMAIL);
  await page.locator('input[name="password"]').fill(STUDENT_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  const errorBox = page.locator('.bg-red-50');
  await expect(errorBox).toHaveCount(0);
});

// UM-02: Wrong password shows error
test('UM-02: Student login fails with incorrect password', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('button', { name: /student/i }).click();
  await page.locator('input[name="email"]').fill(STUDENT_EMAIL);
  await page.locator('input[name="password"]').fill('wrongpassword');
  await page.getByRole('button', { name: /sign in/i }).click();
  const errorBox = page.locator('.bg-red-50');
  await expect(errorBox).toBeVisible({ timeout: 8_000 });
  await expect(errorBox).toContainText(/invalid|incorrect|password/i);
  await expect(page).toHaveURL(/\/login/);
});

// UM-03: New user registration
test('UM-03: New user can register a fresh account', async ({ page }) => {
  const uniqueEmail = `testuser_${Date.now()}@university.edu`;
  await page.goto(`${BASE_URL}/signup`);
  await page.locator('input[name="name"]').fill('Test Student');
  await page.locator('input[name="email"]').fill(uniqueEmail);
  await page.locator('input[name="password"]').fill('password123');
  await page.locator('input[name="confirmPassword"]').fill('password123');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  const errorBox = page.locator('.bg-red-50');
  await expect(errorBox).toHaveCount(0);
});

// UM-04: Profile page shows user details
test('UM-04: Profile page shows the logged-in user\'s details', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto(`${BASE_URL}/profile`);
  await expect(page.getByRole('heading', { name: 'Student' })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText(STUDENT_EMAIL).first()).toBeVisible({ timeout: 8_000 });
});

// UM-05: Admin user management table loads
test('UM-05: Admin panel displays the user management table', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto(`${BASE_URL}/admin/management`);
  await expect(
    page.getByText('User Management', { exact: false })
  ).toBeVisible({ timeout: 10_000 });
  const userRows = page.locator(
    '[class*="rounded-2xl"][class*="flex"][class*="items-center"]:has([class*="font-black"])'
  );
  await expect(userRows.first()).toBeVisible({ timeout: 10_000 });
});