import { chromium } from '@playwright/test';

export async function resetTestEnvironment() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  
  // Clear everything
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  await browser.close();
}