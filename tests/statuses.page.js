import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class StatusesPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, '/task_statuses');

    this.nameInput = () => this.page.locator('input[name="name"]');
    this.slugInput = () => this.page.locator('input[name="slug"]');
    this.submitButton = () =>
      this.page.getByRole('button', { name: /save/i });

    this.selectAllCheckbox = () =>
      this.page.getByRole('checkbox', { name: /select all/i });
    this.deleteSelectedButton = () =>
      this.page.getByRole('button', { name: /delete/i });
  }

  listRoot() {
    return this.page.locator('table.RaDatagrid-table');
  }

  items() {
    return this.page.locator('tbody.RaDatagrid-tbody tr.RaDatagrid-row');
  }

  async goto(path = '/task_statuses') {
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
    return this.items().filter({
      has: this.page.locator('.column-slug'),
      hasText: slug,
    });
  }

  async expectStatusInList({ name, slug }) {
    const row = await this.getStatusRowBySlug(slug);
    await expect(row).toHaveCount(1);
    if (name) {
      await expect(row.locator('.column-name')).toContainText(name);
    }
  }

  async expectStatusNotInList(slug) {
    const row = await this.getStatusRowBySlug(slug);
    await expect(row).toHaveCount(0);
  }

  async openEditFormForStatus(slug) {
    const row = await this.getStatusRowBySlug(slug);
    await expect(row).toHaveCount(1);
    await row.click();
  }

  async deleteStatus(slug) {
    const row = await this.getStatusRowBySlug(slug);
    await expect(row).toHaveCount(1);
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.check();
    await this.deleteSelectedButton().click();
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