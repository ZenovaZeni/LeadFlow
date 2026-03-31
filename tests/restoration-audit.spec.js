import { test, expect } from '@playwright/test';

test.describe('Settings Hub Restoration Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings tab on the demo dashboard
    await page.goto('http://localhost:5174/demo/dashboard?tab=settings');
    await page.waitForTimeout(2000); // Allow for animation/loading
  });

  test('Business Profile has all restored fields', async ({ page }) => {
    await expect(page.getByText('Foundation', { exact: true })).toBeVisible();
    await expect(page.locator('label:has-text("Website URL")')).toBeVisible();
    await expect(page.locator('label:has-text("Physical Address")')).toBeVisible();
    
    await expect(page.getByText('Visual Identity', { exact: true })).toBeVisible();
    await expect(page.locator('label:has-text("Brand Emotion (Emoji)")')).toBeVisible();
    
    await expect(page.getByText('Operating Hours', { exact: true })).toBeVisible();
    // Check for a day of the week
    await expect(page.getByText('monday', { exact: false })).toBeVisible();
  });

  test('AI Intelligence has Primary Goal', async ({ page }) => {
    await page.getByRole('button', { name: /ASSISTANT SETUP/i }).click();
    await expect(page.locator('label:has-text("Primary Objective / AI Goal")')).toBeVisible();
    await expect(page.locator('label:has-text("Communication Tone")')).toBeVisible();
  });

  test('Workflow tab has content', async ({ page }) => {
    await page.getByRole('button', { name: /WORKFLOW/i }).click();
    await expect(page.getByText('Lead Processing', { exact: true })).toBeVisible();
    await expect(page.locator('label:has-text("AI Response Delay")')).toBeVisible();
    await expect(page.locator('label:has-text("Routing Strategy")')).toBeVisible();
  });

  test('Notifications tab has content', async ({ page }) => {
    await page.getByRole('button', { name: /NOTIFICATIONS/i }).click();
    await expect(page.getByText('Alert Preferences', { exact: true })).toBeVisible();
    await expect(page.getByText('Instant SMS Alerts')).toBeVisible();
    await expect(page.getByText('Email Lead Notifications')).toBeVisible();
  });

  test('Booking Rules tab has content', async ({ page }) => {
    await page.getByRole('button', { name: /BOOKING RULES/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Booking Logic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Appointment Specs' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Appointment Duration' })).toBeVisible();
  });
});
