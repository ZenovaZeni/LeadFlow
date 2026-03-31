import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:5174' });

test('Debug Settings Stability and Content', async ({ page }) => {
  // 1. Go to Settings
  await page.goto('/demo/dashboard?tab=settings');
  await page.waitForTimeout(2000);
  
  const sidebar = page.locator('aside').first();
  const getSidebarX = async () => (await sidebar.evaluate(el => el.getBoundingClientRect().x));
  
  // 2. Click through tabs and record sidebar X position and content visibility
  const tabs = [
    { id: 'profile', label: 'BUSINESS PROFILE' },
    { id: 'ai', label: 'AI INTELLIGENCE' },
    { id: 'workflow', label: 'WORKFLOW' },
    { id: 'notifications', label: 'NOTIFICATIONS' }
  ];

  for (const tabInfo of tabs) {
    console.log(`\n--- Testing Tab: ${tabInfo.label} ---`);
    await page.click(`button:has-text("${tabInfo.label}")`);
    await page.waitForTimeout(1000);
    
    const x = await getSidebarX();
    console.log(`Sidebar X position: ${x}px`);
    
    const content = page.locator('.flex-1').first();
    const contentVisible = await content.isVisible();
    const contentHeight = await content.evaluate(el => el.getBoundingClientRect().height);
    console.log(`Content Area Visible: ${contentVisible}, Height: ${contentHeight}px`);
    
    if (tabInfo.id === 'ai') {
      const knowledgeBase = page.locator('text=Knowledge Base');
      const kbVisible = await knowledgeBase.isVisible();
      console.log(`Knowledge Base (FAQs) Visible: ${kbVisible}`);
      
      const aiBio = page.locator('label:has-text("Who is your company?")');
      const bioVisible = await aiBio.isVisible();
      console.log(`AI Bio Visible: ${bioVisible}`);
    }
    
    await page.screenshot({ path: `debug-settings-${tabInfo.id}.png` });
  }
});
