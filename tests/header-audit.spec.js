import { test } from '@playwright/test';
import { join, resolve } from 'path';

const UI_URL = 'http://localhost:5174/';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('Header Visual Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`Capture header screenshot - ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(UI_URL);
      
      // Wait for the header to be visible
      const nav = page.locator('nav.nav');
      await nav.waitFor();
      
      const screenshotPath = resolve(process.cwd(), `playwright-report/header-audit-${vp.name}-final.png`);
      console.log(`Saving screenshot to: ${screenshotPath}`);
      
      // Take a screenshot of just the header or the top part of the page
      await page.screenshot({ 
        path: screenshotPath,
        clip: { x: 0, y: 0, width: vp.width, height: 200 }
      });
    });
  }
});
