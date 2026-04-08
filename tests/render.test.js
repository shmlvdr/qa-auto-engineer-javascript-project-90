// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application renders kanban board with at least one column', async ({ page }) => {
  await page.goto(`${BASE}/tasks`);
  await expect(page.getByTestId('tasks-column').first()).toBeVisible();
});