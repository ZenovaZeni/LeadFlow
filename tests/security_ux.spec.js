import { test, expect } from '@playwright/test';

const HOST = 'http://127.0.0.1:5175';

test.describe('LeadFlow Security & UX Refinements', () => {

  test('Unauthenticated user clicking Skip in onboarding redirects to Demo Dashboard', async ({ page }) => {
    // 1. Go to onboarding
    await page.goto(`${HOST}/onboarding`);
    
    // 2. Click Skip button
    // The Skip button has the text "Skip for now & setup later in settings"
    const skipButton = page.getByText('Skip for now & setup later in settings');
    await expect(skipButton).toBeVisible();
    await skipButton.click();
    
    // 3. Expect redirect to /demo/dashboard
    await expect(page).toHaveURL(/.*demo\/dashboard/);
    
    // 4. Verify Demo Mode badge is visible
    const demoBadge = page.getByText('Demo Mode');
    await expect(demoBadge).toBeVisible();
    
    // 5. Verify Admin Hub is NOT visible
    const adminHubButton = page.getByRole('button', { name: /Admin Hub/i });
    await expect(adminHubButton).not.toBeVisible();
  });

  test('Demo Dashboard shows DEMO MODE indicator', async ({ page }) => {
    // Navigate directly to demo dashboard
    await page.goto(`${HOST}/demo/dashboard`);
    
    // Verify badge
    const demoBadge = page.getByText('Demo Mode');
    await expect(demoBadge).toBeVisible();
    
    // Verify Admin Hub is NOT visible for unauthenticated users on demo dashboard
    const adminHubButton = page.getByRole('button', { name: /Admin Hub/i });
    await expect(adminHubButton).not.toBeVisible();
  });

});
