import { test, expect } from '@playwright/test';

test('Admin Scrape Flow - Start to Finish', async ({ page }) => {
  // 1. Login as Admin
  await page.goto('http://localhost:5174/login');
  
  // Click "Demo Login" - it's a fast way to get in as admin
  const demoBtn = page.getByRole('button', { name: /Demo Login/i });
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
  } else {
    // Manual login if demo btn not there
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
  }

  // 2. Navigate to Admin Hub
  await expect(page).toHaveURL(/.*app/);
  
  // Click Admin Hub tab
  await page.click('button:has-text("Admin Hub")');
  
  // 3. Go to Drafts Tab
  await page.click('button:has-text("Drafting Assistant")');
  
  // 4. Start a New Scrape
  await page.click('button:has-text("New Scrape")');
  
  const testUrl = 'https://www.google.com'; // Simple URL for testing
  const testName = 'Test Business ' + Date.now();
  
  await page.fill('input[placeholder="e.g. Zenova Plumbing"]', testName);
  await page.fill('input[placeholder="www.example.com"]', testUrl);
  
  await page.click('button:has-text("Start Extraction")');
  
  // 5. Wait for completion
  // The status should change through: Queueing request -> Firecrawl -> Gemini -> Draft complete!
  await expect(page.locator('h4:has-text("Draft complete!")')).toBeVisible({ timeout: 60000 });
  
  // 6. Go to Draft List and verify the new row
  await page.click('button:has-text("Go to Draft List")');
  
  // Expect the test business name to be in the list
  await expect(page.locator(`text=${testName}`)).toBeVisible();
  
  // 7. Verify columns are populated
  // Check if status is "review ready"
  const row = page.locator('tr').filter({ hasText: testName });
  await expect(row.locator('span:has-text("review ready")')).toBeVisible();
});
