import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Define the viewports
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 667 }
};

// Define the routes to capture
const routes = [
  { name: 'marketing', url: '/' },
  { name: 'overview', url: '/demo/dashboard?tab=overview' },
  { name: 'leads', url: '/demo/dashboard?tab=leads' },
  { name: 'settings', url: '/demo/dashboard?tab=settings' },
  { name: 'billing', url: '/demo/dashboard?tab=billing' },
];

test.describe('Stitch Visual Audit Captures', () => {
  for (const [device, viewport] of Object.entries(viewports)) {
    test.describe(`Viewport: ${device}`, () => {
      test.use({ viewport });

      for (const route of routes) {
        test(`capture ${route.name}`, async ({ page }) => {
          await page.goto(route.url);
          // Wait for any animations to settle
          await page.waitForTimeout(2000);
          
          if (route.name === 'marketing') {
            await page.evaluate(() => {
              // Ensure dark mode is active for baseline comparison
              if (!document.documentElement.classList.contains('light-mode')) return;
              document.querySelector('.theme-toggle-btn')?.click();
            });
            await page.waitForTimeout(500);
          }

          const filename = `src/reference/stitch-screenshots/${route.name}_${device}.png`;
          await page.screenshot({ path: filename, fullPage: true });
        });
      }
    });
  }
});
