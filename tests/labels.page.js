// tests/labels.page.js
import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class LabelsPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, {
      listTestId: 'labels-table',
      rowTestId: 'label-row',
      createButtonTestId: 'label-create-button',
    });

    this.selectAllCheckbox = () => this.page.getByTestId('label-select-all');
    this.deleteSelectedButton = () =>
      this.page.getByTestId('label-delete-selected');

    this.nameInput = () => this.page.getByTestId('label-name');
    this.slugInput = () => this.page.getByTestId('label-slug');
    this.colorInput = () => this.page.getByTestId('label-color');
    this.submitButton = () => this.page.getByTestId('label-submit');
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
      await expect(this.slugInput()).toBeVisible({ timeout: 1000 });
      await expect(this.submitButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillLabelForm({ name, slug, color }) {
    if (name !== undefined) await this.nameInput().fill(name);
    if (slug !== undefined) await this.slugInput().fill(slug);
    if (color !== undefined && (await this.colorInput().count()) > 0) {
      await this.colorInput().fill(color);
    }
  }

  async submitForm() {
    await this.submitButton().click();
  }

  async getLabelRowBySlug(slug) {
    return this.getRowByKeyText(slug);
  }

  async expectLabelInList({ name, slug }) {
    await this.expectInList(slug, [name]);
  }

  async expectLabelNotInList(slug) {
    await this.expectNotInList(slug);
  }

  async openEditFormForLabel(slug) {
    const row = await this.getLabelRowBySlug(slug);
    const editButton = row.getByTestId('label-edit');
    await editButton.click();
  }

  async deleteLabel(slug) {
    const row = await this.getLabelRowBySlug(slug);
    const deleteButton = row.getByTestId('label-delete');
    await deleteButton.click();
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