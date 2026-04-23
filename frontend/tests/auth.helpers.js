/**
 * Helper to log in as a student using the demo account credentials.
 * @param {import('@playwright/test').Page} page 
 */
export async function loginAsStudent(page) {
  // 0. Wait for backend to be healthy
  console.log('Checking backend health...');
  const backendUrl = 'http://localhost:5001/api/health';
  
  // Basic retry logic for cold starts
  let healthy = false;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await page.request.get(backendUrl);
      const data = await response.json();
      if (data.status === 'OK' && data.database === 'Connected') {
        healthy = true;
        break;
      }
    } catch (e) {
      console.log(`Waiting for backend... attempt ${i+1}`);
      await page.waitForTimeout(2000);
    }
  }

  if (!healthy) {
    console.warn('Backend or Database not ready, but attempting to proceed anyway...');
  }

  // 1. Go to login page
  await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 2. Choose student role
  await page.getByRole('button', { name: /Student/i }).click({ force: true });
  
  // 3. Fill credentials
  await page.fill('input[name="email"]', 'user@campus.edu');
  await page.fill('input[name="password"]', 'user123');
  
  // 4. Click Sign In
  await page.getByRole('button', { name: /Sign In/i }).click({ force: true });
  
  // 5. Wait for the user to be logged in. 
  try {
    await page.waitForSelector('text=Student', { timeout: 20000 });
  } catch (e) {
    await page.waitForSelector('.lucide-user', { timeout: 10000 });
  }
  
  await page.waitForLoadState('networkidle');
}

