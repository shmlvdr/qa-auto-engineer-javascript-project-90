// tests/labels.page.js
import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class LabelsPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, '/labels');

    this.nameInput = () => this.page.locator('input[name="name"]');
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

  async goto(path = '/labels') {
    await super.goto(path);
  }

  async isLabelsListPresent() {
    return this.isListPresent();
  }

  async isLabelFormPresent() {
    try {
      await expect(this.nameInput()).toBeVisible({ timeout: 1000 });
      await expect(this.submitButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillLabelForm({ name }) {
    if (name !== undefined) await this.nameInput().fill(name);
  }

  async submitForm() {
    await this.submitButton().click();
  }

  async getLabelRowByName(name) {
    return this.items().filter({
      has: this.page.locator('.column-name'),
      hasText: name,
    });
  }

  async expectLabelInList({ name }) {
    const row = await this.getLabelRowByName(name);
    await expect(row).toHaveCount(1);
  }

  async expectLabelNotInList(name) {
    const row = await this.getLabelRowByName(name);
    await expect(row).toHaveCount(0);
  }

  async openEditFormForLabel(name) {
    const row = await this.getLabelRowByName(name);
    await expect(row).toHaveCount(1);
    await row.click();
  }

  async deleteLabel(name) {
    const row = await this.getLabelRowByName(name);
    await expect(row).toHaveCount(1);
    const checkbox = row.locator('input[type="checkbox"]');
    await checkbox.check();
    await this.deleteSelectedButton().click();
  }

  async getLabelsCount() {
    return this.getItemsCount();
  }

  async selectAllLabels() {
    await this.selectAllCheckbox().check();
  }

  async deleteSelectedLabels() {
    await this.deleteSelectedButton().click();
  }
}