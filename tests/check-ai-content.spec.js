import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5174' });

test('Check Personality Guardrails existence', async ({ page }) => {
  await page.goto('/demo/dashboard?tab=settings');
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("AI INTELLIGENCE")');
  await page.waitForTimeout(1000);
  
  const guardrailsLabel = page.locator('text=Personality Guardrails');
  console.log(`Guardrails Label Visible: ${await guardrailsLabel.isVisible()}`);
  
  const faqsHeader = page.locator('text=Knowledge Base');
  console.log(`Knowledge Base Header Visible: ${await faqsHeader.isVisible()}`);
  
  // Take full page screenshot
  await page.screenshot({ path: 'debug-settings-ai-full.png', fullPage: true });
});
