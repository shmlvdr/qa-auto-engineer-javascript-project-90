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

    const formPresentBefore = await loginPage.isLoginFormPresent();
    const loggedInBefore = await loginPage.isLoggedIn();

    expect(formPresentBefore).toBeTruthy();
    expect(loggedInBefore).toBeFalsy();

    await loginPage.login('username', 'password');

    const formPresentAfter = await loginPage.isLoginFormPresent();
    const loggedInAfter = await loginPage.isLoggedIn();

    expect(formPresentAfter).toBeFalsy();
    expect(loggedInAfter).toBeTruthy();
  });

  test('Выход из системы (символический)', async () => {
    await loginPage.navigate();

    const formPresentBefore = await loginPage.isLoginFormPresent();
    const loggedInBefore = await loginPage.isLoggedIn();

    expect(formPresentBefore).toBeTruthy();
    expect(loggedInBefore).toBeFalsy();

    await loginPage.login('username', 'password');

    const formPresentAfterLogin = await loginPage.isLoginFormPresent();
    const loggedInAfterLogin = await loginPage.isLoggedIn();

    expect(formPresentAfterLogin).toBeFalsy();
    expect(loggedInAfterLogin).toBeTruthy();

    await loginPage.logout();

    const loggedInAfterLogout = await loginPage.isLoggedIn();
    const loggedOutAfterLogout = await loginPage.isLoggedOut();

    expect(loggedInAfterLogout).toBeFalsy();
    expect(loggedOutAfterLogout).toBeTruthy();
  });
});