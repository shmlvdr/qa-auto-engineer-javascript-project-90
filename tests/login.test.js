import { test, expect } from '@playwright/test';
import LoginPage from './login.page.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Авторизация и выход (UI)', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, BASE);
  });

  test('Успешный вход (символический)', async () => {
    await loginPage.navigate();

    const formPresent = await loginPage.isLoginFormPresent();
    expect(formPresent).toBeTruthy();

    // Любые логин и пароль допустимы
    await loginPage.login('username', 'password');

    expect(await loginPage.isLoggedIn()).toBeTruthy();
  });

  test('Выход из системы (символический)', async () => {
    await loginPage.navigate();

    const formPresent = await loginPage.isLoginFormPresent();
    expect(formPresent).toBeTruthy();

    await loginPage.login('username', 'password');
    expect(await loginPage.isLoggedIn()).toBeTruthy();

    await loginPage.logout();
    expect(await loginPage.isLoggedOut()).toBeTruthy();
  });
});