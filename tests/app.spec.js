import { test, expect } from '@playwright/test';

test.describe('Marketing Site', () => {
  test('loads hero section with correct headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Never Let a Lead');
    await expect(page.locator('h1')).toContainText('Slip Through');
  });

  test('features section renders', async ({ page }) => {
    await page.goto('/');
    // The new design uses grid of features
    const featureHeading = page.getByText('Everything you need to capture', { exact: false });
    await expect(featureHeading).toBeVisible();
  });

  test('pricing section shows correct amount', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('$97')).toBeVisible();
  });

  test('FAQ accordion expands on click', async ({ page }) => {
    await page.goto('/');
    const firstFaq = page.locator('details').first();
    await firstFaq.click();
    await expect(firstFaq).toHaveAttribute('open', '');
  });
});

test.describe('Demo Flow', () => {
  test('navigates to demo and shows customer form', async ({ page }) => {
    await page.goto('/');
    // Find the "See How It Works" or "Demo" button in the hero
    await page.getByText('See How It Works', { exact: false }).first().click();
    await expect(page.locator('.customer-form-wrapper')).toBeVisible();
  });

  test('submitting form transitions to SMS view', async ({ page }) => {
    await page.goto('/');
    await page.getByText('See How It Works', { exact: false }).first().click();
    await expect(page.locator('.customer-form-wrapper')).toBeVisible();
    await page.locator('.customer-form-wrapper form button[type="submit"]').click();
    await expect(page.locator('.sms-phone')).toBeVisible({ timeout: 10000 });
  });

  test('SMS messages animate in over time', async ({ page }) => {
    await page.goto('/');
    await page.getByText('See How It Works', { exact: false }).first().click();
    await page.locator('.customer-form-wrapper form button[type="submit"]').click();
    await expect(page.locator('.sms-phone')).toBeVisible({ timeout: 10000 });
    // Wait for at least 2 messages to appear
    await expect(async () => {
      const count = await page.locator('.sms-bubble').count();
      expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 15000 });
  });
});


test.describe('Login & Dashboard', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Welcome back');
  });

  test('logging in navigates to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('demo@demo.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('.dash')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard shows stats', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('demo@demo.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.locator('form button[type="submit"]').click();
    // New design uses .glass-card for stats
    await expect(page.locator('.glass-card')).toHaveCount(5, { timeout: 10000 });
  });

  test('settings page renders restored sections', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('demo@demo.com');
    await page.locator('input[type="password"]').fill('demo');
    await page.locator('form button[type="submit"]').click();
    // Navigate to settings via URL to be sure
    await page.goto('/demo/dashboard?tab=settings');
    
    // Check for primary sections
    await expect(page.getByText('Foundation')).toBeVisible();
    await expect(page.getByText('Operational Bounds')).toBeVisible();
    await expect(page.getByText('Branded Page Visuals')).toBeVisible();
    
    // Verify restored fields
    await expect(page.getByLabel('Business Email')).toBeVisible();
    await expect(page.getByLabel('Hero Headline')).toBeVisible();
  });

  test('logout returns to marketing site', async ({ page }) => {
    await page.goto('/demo/dashboard');
    await page.locator('text=Log Out').click();
    await expect(page.locator('h1')).toContainText('Never Let a Lead');
  });
});
