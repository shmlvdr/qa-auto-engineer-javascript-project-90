// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('приложение Task Manager рендерит доску задач', async ({ page }) => {
  await page.goto(BASE);
  const root = page.locator('#root');
  await expect(root).toBeVisible();
  const rootChildrenCount = await root.locator('*').count();
  expect(rootChildrenCount).toBeGreaterThan(0);
  await page.getByLabel(/username/i).fill('username');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.goto(`${BASE}/tasks`);
  await expect(page.getByText('Tasks')).toBeVisible();
});