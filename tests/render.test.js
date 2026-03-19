// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application loads and root container is visible', async ({ page }) => {
  await page.goto(BASE);

  const root = page.locator('#root');
  await expect(root).toBeVisible();

  const childrenCount = await root.locator('> *').count();
  expect(childrenCount).toBeGreaterThan(0);
});