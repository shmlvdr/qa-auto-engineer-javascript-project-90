import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';

test('app renders correctly', async ({ page }) => {
  await page.goto(BASE);

  await expect(page.locator('#root')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vite + React' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Vite logo' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'React logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: /count is 0/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /count is 0/i })).toHaveText(/count is 0/i);
});