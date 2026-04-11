import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('приложение Task Manager рендерит доску задач и её ключевые элементы', async ({ page }) => {
  await page.goto(BASE);

  await page.getByLabel(/username/i).fill('username');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.goto(`${BASE}/tasks`);

  await expect(page.getByText('Tasks')).toBeVisible();
});