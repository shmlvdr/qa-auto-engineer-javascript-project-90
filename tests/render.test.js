// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test('application mounts React app into #root without errors', async ({ page }) => {
  await page.goto(BASE);

  // 1. Корневой контейнер существует и виден
  const root = page.locator('#root');
  await expect(root).toBeVisible();

  // 2. Внутри #root есть хотя бы один дочерний элемент — значит, React что-то смонтировал
  const children = root.locator('*');
  const childrenCount = await children.count();
  expect(childrenCount).toBeGreaterThan(0);
});