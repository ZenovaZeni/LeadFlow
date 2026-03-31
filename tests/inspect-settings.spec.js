import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5174' });

test('Inspect Settings DOM', async ({ page }) => {
  await page.goto('/demo/dashboard?tab=settings');
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("AI INTELLIGENCE")');
  await page.waitForTimeout(1000);
  
  const contentHtml = await page.locator('.flex-1').first().innerHTML();
  console.log('AI Content HTML Snapshot:');
  console.log(contentHtml.substring(0, 5000)); // Print first 5000 chars

  const boxCount = await page.locator('.bg-\\[\\#091328\\]\\/40').count();
  console.log(`Number of setting boxes found: ${boxCount}`);
});
