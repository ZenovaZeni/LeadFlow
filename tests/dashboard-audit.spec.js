import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

const tabs = ['overview', 'leads', 'settings'];

for (const viewport of viewports) {
  test.describe(`${viewport.name} audit`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const tab of tabs) {
      test(`audit ${tab} tab`, async ({ page }) => {
        await page.goto(`http://localhost:5174/demo/dashboard?tab=${tab}`);
        // Wait for data to load (simulated)
        await page.waitForTimeout(1000);
        
        // Take screenshot
        const screenshotPath = `C:/Users/joshs/.gemini/antigravity/brain/70f70152-4054-4877-a2c5-6085d5943fe3/audit-${tab}-${viewport.name}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`Captured ${screenshotPath}`);
      });
    }
  });
}
