// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application loads and displays key elements', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('#root')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /vite \+ react/i }),
  ).toBeVisible();
});