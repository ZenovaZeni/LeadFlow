---
description: Automated End-to-End Testing with Playwright Specs
---

# 🎭 Playwright E2E Testing Guide

This workflow documents how to test the LeadFlow application using Playwright to ensure zero regressions on critical landing or auth thresholds.

---

## 🟢 1. When to use Playwright
*   **Before pushing to Production**: Guarantee nothing crashes on absolute endpoints.
*   **After editing guards**: Verify `<ProtectedRoute>` captures unauthenticated accesses correctly.
*   **After changing forms**: Ensure validations are blocking empty submits correctly.

---

## 🔵 2. Essential Commands

Run these inside your terminal standing in the project root:

| Command | Description |
|:---|:---|
| `npx playwright test` | Runs all tests in the background (headless) fast. |
| `npx playwright test --headed` | Runs tests on a real browser window you can watch. |
| `npx playwright show-report` | Opens an interactive HTML dashboard of test logs. |
| `npx playwright test tests/auth.spec.js` | Runs just ONE specific test file. |

---

## 🟣 3. Critical Use Cases for This App

### 🔒 A. Auth Guards Redirects
*   **Test**: Navigate to `/app` directly.
*   **Assert**: URL changes instantly to `/login`.

### 📋 B. Onboarding Form Flow
*   **Test**: Step 1 -> fill name -> Next. Step 2 -> fill industry -> Next. Step 3 -> Complete submit.
*   **Assert**: Screen displays `"Onboarding Complete!"` text container.

---

## 🟠 4. Creating a Test (Recipe)

Test files live in `tests/name.spec.js`. Here is a standard baseline lookup:

```javascript
import { test, expect } from '@playwright/test';

test('forces unauth to login', async ({ page }) => {
  // 1. Visit protected endpoint
  await page.goto('http://localhost:5173/app');
  
  // 2. Expect to get bounced to login
  await expect(page).toHaveURL(/.*login/);
});
```

---

> [!TIP]
> **To test mock-flows safely**: You can use `await page.route()` in advanced modes to intercept Supabase API calls so you never pollute your real live database during continuous integration tests.
