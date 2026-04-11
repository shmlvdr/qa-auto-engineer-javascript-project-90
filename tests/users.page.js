// tests/users.page.js
import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class UsersPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, '/users');

    this.emailInput = () => this.page.locator('input[name="email"]');
    this.firstNameInput = () => this.page.locator('input[name="firstName"]');
    this.lastNameInput = () => this.page.locator('input[name="lastName"]');
    this.submitButton = () =>
      this.page.getByRole('button', { name: /save/i });

    this.selectAllCheckbox = () =>
      this.page.getByRole('checkbox', { name: /select all/i });
    this.deleteSelectedButton = () =>
      this.page.getByRole('button', { name: /delete/i });

    this.emailError = () =>
      this.page.locator('[id*="email"][id$="-helper-text"]');
  }

  listRoot() {
    return this.page.locator('table.RaDatagrid-table');
  }

  items() {
    return this.page.locator('tbody.RaDatagrid-tbody tr.RaDatagrid-row');
  }

  async goto(path = '/users') {
    await super.goto(path);
  }

  async isUsersListPresent() {
    return this.isListPresent();
  }

  async isUserFormPresent() {
    try {
      await expect(this.emailInput()).toBeVisible({ timeout: 1000 });
      await expect(this.firstNameInput()).toBeVisible({ timeout: 1000 });
      await expect(this.lastNameInput()).toBeVisible({ timeout: 1000 });
      await expect(this.submitButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillUserForm({ email, firstName, lastName }) {
    if (email !== undefined) await this.emailInput().fill(email);
    if (firstName !== undefined) await this.firstNameInput().fill(firstName);
    if (lastName !== undefined) await this.lastNameInput().fill(lastName);
  }

  async submitForm() {
    await this.submitButton().click();
  }

  async getUserRowByEmail(email) {
    return this.items().filter({
      has: this.page.locator('.column-email'),
      hasText: email,
    });
  }

  async expectUserInList({ email, firstName, lastName }) {
    const row = await this.getUserRowByEmail(email);
    await expect(row).toHaveCount(1);
    if (firstName) {
      await expect(row.locator('.column-firstName')).toContainText(firstName);
    }
    if (lastName) {
      await expect(row.locator('.column-lastName')).toContainText(lastName);
    }
  }

  async expectUserNotInList(email) {
    const row = await this.getUserRowByEmail(email);
    await expect(row).toHaveCount(0);
  }

  async openEditFormForUser(email) {
    const row = await this.getUserRowByEmail(email);
    await expect(row).toHaveCount(1);
    await row.click();
  }

  async deleteUser(email) {
    const row = await this.getUserRowByEmail(email);
    await expect(row).toHaveCount(1);
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.check();
    await this.deleteSelectedButton().click();
  }

  async getUsersCount() {
    return this.getItemsCount();
  }

  async selectAllUsers() {
    await this.selectAllCheckbox().check();
  }

  async deleteSelectedUsers() {
    await this.deleteSelectedButton().click();
  }
}