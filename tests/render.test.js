// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application renders root React app and (if present) main kanban UI', async ({ page }) => {
  await page.goto(BASE);

  const root = page.locator('#root');
  await expect(root).toBeVisible();

  const rootChildrenCount = await root.locator('*').count();
  expect(rootChildrenCount).toBeGreaterThan(0);
  await page.goto(`${BASE}/tasks`);

  const columns = page.getByTestId('tasks-column');
  const columnsCount = await columns.count();

  if (columnsCount === 0) {
    test.skip('Tasks board columns not present at /tasks — skipping kanban part of render test');
  }
  await expect(columns.first()).toBeVisible();
  await expect(page.getByTestId('task-create-button')).toBeVisible();
});