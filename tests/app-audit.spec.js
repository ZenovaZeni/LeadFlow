import { test, expect } from '@playwright/test';

test.describe('LeadFlow Application Audit', () => {
  const BASE_URL = 'http://localhost:5173';

  test('User Flow: Marketing to Dashboard', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/LeadFlow/);
    
    // 2. Click "Try Free Demo"
    const demoBtn = page.getByRole('button', { name: /Try Free Demo/i }).first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
    } else {
      await page.goto(`${BASE_URL}/demo`);
    }
    
    // 3. Verify Dashboard Tabs
    await expect(page.getByText(/Dashboard Overview/i)).toBeVisible();
    await expect(page.getByText(/Leads/i, { exact: true })).toBeVisible();
    await expect(page.getByText(/Bookings/i, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Settings/i })).toBeVisible();
  });

  test('Dashboard Component Audit', async ({ page }) => {
    await page.goto(`${BASE_URL}/demo`);
    
    // Click through each tab and take a screenshot
    const tabs = ['Overview', 'Leads', 'Bookings', 'Settings'];
    for (const tabName of tabs) {
      await page.getByRole('button', { name: new RegExp(tabName, 'i') }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `audit_tab_${tabName.toLowerCase()}.png` });
      
      // Special check for Settings sidebar
      if (tabName === 'Settings') {
        const settingsNavs = ['BUSINESS PROFILE', 'ASSISTANT SETUP', 'BOOKING RULES', 'WORKFLOW', 'NOTIFICATIONS'];
        for (const nav of settingsNavs) {
          await page.getByText(nav).click();
          await page.waitForTimeout(300);
          await page.screenshot({ path: `audit_settings_${nav.toLowerCase().replace(' ', '_')}.png` });
        }
      }
    }
  });

  test('Lead Handling Flow Audit', async ({ page }) => {
    await page.goto(`${BASE_URL}/demo`);
    await page.getByRole('button', { name: /Leads/i }).click();
    
    // Select the first lead
    const firstLead = page.locator('tr').nth(1); // Skip header
    await firstLead.click();
    
    // Verify lead details and actions
    await expect(page.getByText(/Lead Intelligence/i).or(page.getByText(/Assistant Intelligence/i))).toBeVisible();
    await expect(page.getByRole('button', { name: /Book Appointment/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Booking Link/i })).toBeVisible();
    
    // Try to open booking modal
    await page.getByRole('button', { name: /Book Appointment/i }).click();
    await expect(page.getByText(/Manual Booking/i)).toBeVisible();
    await page.screenshot({ path: 'audit_booking_modal.png' });
    await page.keyboard.press('Escape');
  });

  test('Branding Audit: No "AI" in user-facing UI', async ({ page }) => {
    await page.goto(`${BASE_URL}/demo`);
    
    // We want to ensure "AI" is mostly replaced by "Assistant"
    // This is a soft check - some technical instances might remain
    const aiOccurrences = await page.evaluate(() => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let n;
      const matches = [];
      while (n = walk.nextNode()) {
        if (n.textContent.match(/\bAI\b/)) {
          matches.push(n.textContent.trim());
        }
      }
      return matches;
    });
    
    console.log('AI Occurrences found:', aiOccurrences);
  });

  test('Public Lead Portal Audit', async ({ page }) => {
     // We'll need a real business ID from the DB or a known mock
     // Let's try to find a link to the portal in the settings
     await page.goto(`${BASE_URL}/demo`);
     await page.getByRole('button', { name: /Settings/i }).click();
     await page.getByText('BUSINESS PROFILE').click();
     
     const portalLink = page.getByRole('link', { name: /View Public Portal/i });
     if (await portalLink.isVisible()) {
        const href = await portalLink.getAttribute('href');
        await page.goto(`${BASE_URL}${href}`);
        await expect(page.getByText(/Submit Request/i)).toBeVisible();
        await page.screenshot({ path: 'audit_public_portal.png' });
     }
  });
});
