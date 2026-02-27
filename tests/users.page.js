import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class UsersPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, {
      listTestId: 'users-table',
      rowTestId: 'user-row',
      createButtonTestId: 'user-create-button',
    });

    this.selectAllCheckbox = () => this.page.getByTestId('user-select-all');
    this.deleteSelectedButton = () =>
      this.page.getByTestId('user-delete-selected');

    this.emailInput = () => this.page.getByTestId('user-email');
    this.firstNameInput = () => this.page.getByTestId('user-firstName');
    this.lastNameInput = () => this.page.getByTestId('user-lastName');
    this.submitButton = () => this.page.getByTestId('user-submit');
    this.emailError = () => this.page.getByTestId('user-email-error');
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
    return this.getRowByKeyText(email);
  }

  async expectUserInList({ email, firstName, lastName }) {
    await this.expectInList(email, [firstName, lastName]);
  }

  async expectUserNotInList(email) {
    await this.expectNotInList(email);
  }

  async openEditFormForUser(email) {
    const row = await this.getUserRowByEmail(email);
    const editButton = row.getByTestId('user-edit');
    await editButton.click();
  }

  async deleteUser(email) {
    const row = await this.getUserRowByEmail(email);
    const deleteButton = row.getByTestId('user-delete');
    await deleteButton.click();
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