import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('приложение Task Manager рендерит корень и раздел Tasks', async ({ page }) => {
  await page.goto(BASE);

  await expect(page.locator('#root')).toBeVisible();

  await page.getByLabel(/username/i).fill('username');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.getByRole('menuitem', { name: /^tasks$/i }).click();

  const tasksTitle = page.locator('#react-admin-title', { hasText: 'Tasks' });
  await expect(tasksTitle).toBeVisible();
});