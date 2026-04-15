import { expect } from '@playwright/test';

const UI_TIMEOUT = 1000;

export default class LoginPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');

    this.loginInput = () => this.page.getByLabel(/username/i);
    this.passwordInput = () => this.page.getByLabel(/password/i);
    this.signInButton = () =>
      this.page.getByRole('button', { name: /sign in/i });

    this.profileButton = () =>
      this.page.getByRole('button', { name: /jane doe|profile/i });

    this.logoutMenuItem = () =>
      this.page
        .locator('li[role="menuitem"]')
        .filter({ hasText: 'Logout' });
  }

  async goto(path = '/login') {
    await this.page.goto(this.baseUrl + path);
  }

  async navigate(path = '/login') {
    return this.goto(path);
  }

  async isLoginFormPresent() {
    try {
      await expect(this.loginInput()).toBeVisible({ timeout: UI_TIMEOUT });
      await expect(this.passwordInput()).toBeVisible({ timeout: UI_TIMEOUT });
      await expect(this.signInButton()).toBeVisible({ timeout: UI_TIMEOUT });
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

  async isLoggedIn() {
    try {
      await expect(this.profileButton()).toBeVisible({ timeout: UI_TIMEOUT * 2 });
      return true;
    } catch {
      return false;
    }
  }

  async logout() {
    try {
      await this.profileButton().click();
    } catch {}
    await this.logoutMenuItem().click();
  }

  async isLoggedOut() {
    try {
      await expect(this.loginInput()).toBeVisible({ timeout: UI_TIMEOUT * 2 });
      return true;
    } catch {
      return false;
    }
  }
}