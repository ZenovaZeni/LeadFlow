import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 812 }
];

for (const vp of viewports) {
  test(`Audit Dashboard - ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    
    // Test both Marketing and Dashboard
    const routes = [
      { name: 'Marketing', path: '/' },
      { name: 'Dashboard', path: '/demo/dashboard' }
    ];

    for (const route of routes) {
      await page.goto(route.path);
      // Wait for any animations
      await page.waitForTimeout(1000);
      
      const fileName = `audit-${route.name}-${vp.name}.png`.toLowerCase();
      await page.screenshot({ path: `playwright-report/${fileName}`, fullPage: true });
    }
  });
}
