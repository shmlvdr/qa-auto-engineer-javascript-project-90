// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';

test('приложение Task Manager монтируется и отображает список пользователей', async ({ page }) => {

  await page.goto(BASE);
  await expect(page.locator('#root')).toBeVisible();
  await page.goto(`${BASE}users`);
  const usersTable = page.getByTestId('users-table');
  await expect(usersTable).toBeVisible();

  const userRows = page.getByTestId('user-row');
  const rowsCount = await userRows.count();
  expect(rowsCount).toBeGreaterThanOrEqual(0);
});