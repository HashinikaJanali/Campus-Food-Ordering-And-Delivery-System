import { test } from '@playwright/test';
import { loginAsStudent } from './auth.helpers';
import { chromium } from '@playwright/test';
import fs from 'fs';

async function resetTestEnvironment() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (e) {}
  await browser.close();
}

test.beforeAll(async () => {
  await resetTestEnvironment();
});

test('debug: write DOM info to file', async ({ page }) => {
  test.setTimeout(60000);
  
  await loginAsStudent(page);
  await page.goto('/feedback?tab=feedback');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => {
    // Get all SVG class attributes
    const svgs = Array.from(document.querySelectorAll('svg'));
    const starSvgs = svgs.filter(s => (s.getAttribute('class') || '').includes('lucide'));
    
    // Get all buttons with their inner HTML snippets
    const buttons = Array.from(document.querySelectorAll('button'));
    const buttonInfo = buttons.map(b => ({
      text: b.textContent?.trim().substring(0, 60),
      hasSvg: b.querySelector('svg') !== null,
      svgClass: b.querySelector('svg')?.getAttribute('class') || null,
      parentClass: b.parentElement?.className?.substring(0, 80) || null
    }));

    // Get textareas
    const textareas = Array.from(document.querySelectorAll('textarea')).map(t => ({
      placeholder: t.placeholder,
      visible: t.offsetParent !== null,
      class: t.className?.substring(0, 80)
    }));

    return {
      starSvgCount: starSvgs.length,
      starSvgClasses: starSvgs.map(s => s.getAttribute('class')),
      buttonCount: buttons.length,
      buttons: buttonInfo,
      textareas,
      hasRateYourOrders: document.body.textContent?.includes('Rate Your Recent Orders'),
      pageTitle: document.title
    };
  });

  fs.writeFileSync('tests/dom-debug.json', JSON.stringify(info, null, 2));
  console.log('Written to tests/dom-debug.json');
  console.log('Star SVG count:', info.starSvgCount);
  console.log('Button count:', info.buttonCount);
  console.log('Has Rate Your Orders:', info.hasRateYourOrders);
});
