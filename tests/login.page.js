// tests/login.page.js
import { expect } from '@playwright/test';

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

  async isLoggedIn() {
    try {
      await expect(this.profileButton()).toBeVisible({ timeout: 2000 });
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
      await expect(this.loginInput()).toBeVisible({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}