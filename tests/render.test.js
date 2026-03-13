// tests/render.test.js
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/';

test('application loads and displays key elements', async ({ page }) => {
  await page.goto(BASE);

  // 1. Контейнер приложения существует и виден
  await expect(page.locator('#root')).toBeVisible();

  // 2. Основной заголовок приложения
  // Сейчас он "Vite + React", но как только переименуешь — обнови это ожидание.
  await expect(
    page.getByRole('heading', { name: /vite \+ react/i })
  ).toBeVisible();

  // 3. Проверка наличия основного интерактивного элемента (кнопки),
  // указывающего, что приложение отрендерилось и работает.
  await expect(
    page.getByRole('button', { name: /count is/i })
  ).toBeVisible();

  // 4. Проверка основного текста-инструкции
  await expect(
    page.getByText(/Click on the Vite and React logos to learn more/i)
  ).toBeVisible();
});