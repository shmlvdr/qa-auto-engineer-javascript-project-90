import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class StatusesPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, {
      listTestId: 'statuses-table',
      rowTestId: 'status-row',
      createButtonTestId: 'status-create-button',
    });

    this.selectAllCheckbox = () => this.page.getByTestId('status-select-all');
    this.deleteSelectedButton = () =>
      this.page.getByTestId('status-delete-selected');

    this.nameInput = () => this.page.getByTestId('status-name');
    this.slugInput = () => this.page.getByTestId('status-slug');
    this.submitButton = () => this.page.getByTestId('status-submit');
  }

  async goto(path = '/statuses') {
    await super.goto(path);
  }

  async isStatusesListPresent() {
    return this.isListPresent();
  }

  async isStatusFormPresent() {
    try {
      await expect(this.nameInput()).toBeVisible({ timeout: 1000 });
      await expect(this.slugInput()).toBeVisible({ timeout: 1000 });
      await expect(this.submitButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillStatusForm({ name, slug }) {
    if (name !== undefined) await this.nameInput().fill(name);
    if (slug !== undefined) await this.slugInput().fill(slug);
  }

  async submitForm() {
    await this.submitButton().click();
  }

  async getStatusRowBySlug(slug) {
    return this.getRowByKeyText(slug);
  }

  async expectStatusInList({ name, slug }) {
    await this.expectInList(slug, [name]);
  }

  async expectStatusNotInList(slug) {
    await this.expectNotInList(slug);
  }

  async openEditFormForStatus(slug) {
    const row = await this.getStatusRowBySlug(slug);
    const editButton = row.getByTestId('status-edit');
    await editButton.click();
  }

  async deleteStatus(slug) {
    const row = await this.getStatusRowBySlug(slug);
    const deleteButton = row.getByTestId('status-delete');
    await deleteButton.click();
  }

  async getStatusesCount() {
    return this.getItemsCount();
  }

  async selectAllStatuses() {
    await this.selectAllCheckbox().check();
  }

  async deleteSelectedStatuses() {
    await this.deleteSelectedButton().click();
  }
}