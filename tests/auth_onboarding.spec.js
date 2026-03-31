import { test, expect } from '@playwright/test';

test.describe('Production Client Pipeline', () => {

  test('forces unauthenticated user to Redirect from /app to /login', async ({ page }) => {
    // 1. Try accessing protected app
    await page.goto('/app');
    
    // 2. Expect to be redirected to login page
    // Note: Depends on bypassAuth being false. Since it is false, this should trigger.
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.login-header h1')).toHaveText('Welcome back');
  });

  test('onboarding multistep form saves successfully', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Step 1: Basics
    await expect(page.locator('h3', { hasText: 'Basic Information' })).toBeVisible();
    await page.fill('input[name="fullName"]', 'Test Runner');
    await page.fill('input[name="businessName"]', 'Automated Corp');
    await page.fill('input[name="email"]', 'test@automated.com');
    await page.fill('input[name="phone"]', '(555) 123-4567');
    await page.click('button:text("Next Step")');

    // Step 2: Scope
    await expect(page.locator('h3', { hasText: 'Business Scope' })).toBeVisible();
    await page.fill('input[name="industry"]', 'Software QA');
    await page.fill('textarea[name="servicesOffered"]', 'End-to-End browser testing');
    await page.click('button:text("Next Step")');

    // Step 3: AI Specs
    await expect(page.locator('h3', { hasText: 'AI Assistant Specs' })).toBeVisible();
    await page.fill('textarea[name="qualQuestions"]', '1. Do you use Node.js?');
    
    // --- Mocking API to avoid polluting real DB ---
    // Uncomment this to test completely isolated without hitting Supabase:
    await page.route('**/rest/v1/onboarding_submissions', async (route) => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
    });

    await page.click('button:text("Complete Onboarding")');

    // Success State
    await expect(page.locator('.success-icon')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2')).toContainText('Onboarding Complete!');
  });

});
