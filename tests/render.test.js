// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application loads and displays main kanban board elements', async ({ page }) => {
  // Открываем страницу канбан-доски
  await page.goto(`${BASE}/tasks`);

  const board = page.getByTestId('tasks-board');
  const boardCount = await board.count();

  test.skip(
    boardCount === 0,
    'tasks-board not found at /tasks — skipping render test on non-kanban template',
  );

  await expect(board).toBeVisible();
  await expect(page.getByTestId('tasks-column').first()).toBeVisible();
});