import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5177' });

test('Final Verification', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('/demo/dashboard?tab=settings');
  await page.waitForTimeout(2000);
  
  const tabs = ['BUSINESS PROFILE', 'AI INTELLIGENCE', 'WORKFLOW', 'NOTIFICATIONS'];
  const results = [];

  for (const tab of tabs) {
    await page.click(`button:has-text("${tab}")`);
    await page.waitForTimeout(1000);
    
    // Check Sidebar X
    const sidebar = page.locator('aside').first();
    const box = await sidebar.boundingBox();
    console.log(`Tab: ${tab}, Sidebar X: ${box.x}, Sidebar Width: ${box.width}`);
    results.push({ tab, x: box.x });

    if (tab === 'AI INTELLIGENCE') {
      const goalVisible = await page.locator('text=Primary Objective / AI Goal').isVisible();
      console.log(`AI Goal Visible: ${goalVisible}`);
      expect(goalVisible).toBe(true);
    }
  }

  // Verify stability (all X should be equal)
  const firstX = results[0].x;
  for (const res of results) {
    console.log(`Checking ${res.tab}: X=${res.x} (expected ${firstX})`);
    expect(res.x).toBeCloseTo(firstX, 1);
  }
  
  await page.screenshot({ path: 'final-verification.png', fullPage: true });
});
