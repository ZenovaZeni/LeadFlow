import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5174' });

test('Verify UI issues: Black inputs, Back button, Settings tabs', async ({ page }) => {
  // 1. Check Demo Flow Inputs
  await page.goto('/demo');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'repro-demo-form.png' });
  
  const nameInput = page.locator('input[placeholder="Marcus Rivera"]');
  const bgColor = await nameInput.evaluate(el => window.getComputedStyle(el).backgroundColor);
  console.log(`Demo Input Background Color: ${bgColor}`);

  // 2. Check "Back breaks the flow"
  await nameInput.fill('Test User');
  await page.locator('input[placeholder="(813) 555-0142"]').fill('(555) 555-5555');
  await page.locator('textarea').fill('Test Service');
  await page.click('button:has-text("Submit Request")');
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'repro-demo-step2.png' });
  
  // Click back at step 2
  await page.click('button:has-text("Back")');
  await page.waitForTimeout(500);
  console.log(`URL after clicking Back at Step 2: ${page.url()}`);
  if (page.url().endsWith('/')) {
    console.log('BUG CONFIRMED: Back button navigated out of demo instead of going to previous step.');
  }

  // 3. Check Settings Tab Widths
  await page.goto('/demo/dashboard');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(1000);
  
  // Navigate to different tabs to see if sidebar changes
  const sidebar = page.locator('aside');
  const initialWidth = await sidebar.evaluate(el => el.getBoundingClientRect().width);
  console.log(`Initial Settings Sidebar Width: ${initialWidth}px`);
  
  const tabs = page.locator('aside button');
  const tabCount = await tabs.count();
  for (let i = 0; i < tabCount; i++) {
    const tab = tabs.nth(i);
    const label = await tab.locator('span').last().textContent();
    const tabWidth = await tab.evaluate(el => el.getBoundingClientRect().width);
    console.log(`Tab "${label}" Width: ${tabWidth}px`);
  }
  
  await page.screenshot({ path: 'repro-settings-tabs.png' });
});
