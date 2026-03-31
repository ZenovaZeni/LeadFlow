import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

test('mobile dashboard graph polish', async ({ page }) => {
  await page.goto('/');
  
  // Go directly to the demo dashboard since we want to test the UI components
  await page.goto('/demo/dashboard');

  // Check for the chart
  const chart = page.locator('.overview-row').first(); // Adjust selector based on actual layout
  await expect(chart).toBeVisible();

  // Check legend
  const legend = page.locator('.chart-legend-container');
  await expect(legend).toBeVisible();
  
  // Check for tooltip on hover/click
  const trigger = page.locator('rect[fill="transparent"]').first();
  await trigger.click();
  
  const tooltip = page.locator('g[transform*="translate"] rect').first();
  await expect(tooltip).toBeVisible();

  // Take screenshot for visual audit
  await page.screenshot({ path: 'playwright-report/mobile-graph-audit.png' });
});
