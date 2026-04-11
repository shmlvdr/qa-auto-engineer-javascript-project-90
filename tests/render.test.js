import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('приложение Task Manager рендерит корень и первую колонку канбан-доски', async ({ page }) => {
  await page.goto(BASE);

  await expect(page.locator('#root')).toBeVisible();

  await page.getByLabel(/username/i).fill('username');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.getByRole('menuitem', { name: /tasks/i }).click();

  const draftColumn = page
    .getByRole('heading', { name: /^draft$/i })
    .locator('xpath=..')
    .locator('div[data-rfd-droppable-id]');

  await expect(draftColumn).toBeVisible();
});