// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';

test('приложение Task Manager монтируется в #root', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('#root')).toBeVisible();
});