import { expect } from '@playwright/test';

export default class LoginPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.loginInput = () => this.page.getByTestId('login-input');
    this.passwordInput = () => this.page.getByTestId('password-input');
    this.signInButton = () =>
      this.page.getByRole('button', { name: /sign in/i });
    this.protectedContent = () => this.page.getByTestId('protected');
    this.logoutButton = () =>
      this.page.getByRole('button', { name: /logout/i });
    this.greeting = (username) =>
      this.page.getByText(new RegExp(`Welcome,\\s*${username}`, 'i'));
  }

  async goto(path = '/login') {
    await this.page.goto(this.baseUrl + path);
  }

  async navigate(path = '/login') {
    return this.goto(path);
  }

  async isLoginFormPresent() {
    try {
      await expect(this.loginInput()).toBeVisible({ timeout: 1000 });
      await expect(this.passwordInput()).toBeVisible({ timeout: 1000 });
      await expect(this.signInButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async login(username, password) {
    await this.loginInput().fill(username);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async isLoggedIn(username) {
    try {
      await expect(this.greeting(username)).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      try {
        await expect(this.protectedContent()).toBeVisible({ timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    }
  }

  async logout() {
    await this.logoutButton().click();
  }

  async isLoggedOut() {
    try {
      await expect(this.protectedContent()).toBeHidden({ timeout: 2000 });
    } catch {
      // игнорируем отсутствие protected-блока
    }

    try {
      await expect(this.loginInput()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}