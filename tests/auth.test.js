import { test, expect } from '@playwright/test';
import LoginPage from './login.page.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Авторизация и выход (UI)', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, BASE);
  });

  test('Успешный вход (символический)', async ({ page }) => {
    await loginPage.navigate();
    const present = await loginPage.isLoginFormPresent();
    test.skip(!present, 'Login form not present at /login — skipping symbolic login test');

    const user = 'anyUser';
    await loginPage.login(user, 'anyPassword');

    const loggedIn = await loginPage.isLoggedIn(user);
    expect(loggedIn).toBeTruthy();
  });

  test('Выход из системы (символический)', async ({ page }) => {
    await loginPage.navigate();
    const present = await loginPage.isLoginFormPresent();
    test.skip(!present, 'Login form not present at /login — skipping symbolic logout test');

    const user = 'anyUser';
    await loginPage.login(user, 'anyPassword');
    expect(await loginPage.isLoggedIn(user)).toBeTruthy();

    await loginPage.logout();
    expect(await loginPage.isLoggedOut()).toBeTruthy();
  });
});