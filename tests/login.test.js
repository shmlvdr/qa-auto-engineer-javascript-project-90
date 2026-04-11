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

    // До логина: форма видна, профиля нет
    expect(await loginPage.isLoginFormPresent()).toBeTruthy();
    expect(await loginPage.isLoggedIn()).toBeFalsy();

    await loginPage.login('username', 'password');

    // После логина: форма скрыта, профиль виден
    expect(await loginPage.isLoginFormPresent()).toBeFalsy();
    expect(await loginPage.isLoggedIn()).toBeTruthy();
  });

  test('Выход из системы (символический)', async () => {
    await loginPage.navigate();

    // Начальное состояние
    expect(await loginPage.isLoginFormPresent()).toBeTruthy();
    expect(await loginPage.isLoggedIn()).toBeFalsy();

    await loginPage.login('username', 'password');

    // После логина
    expect(await loginPage.isLoginFormPresent()).toBeFalsy();
    expect(await loginPage.isLoggedIn()).toBeTruthy();

    await loginPage.logout();

    // После выхода: профиля нет, форма снова есть
    expect(await loginPage.isLoggedIn()).toBeFalsy();
    expect(await loginPage.isLoggedOut()).toBeTruthy();
  });
});