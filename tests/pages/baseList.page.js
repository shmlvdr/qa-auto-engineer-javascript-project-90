import { expect } from '@playwright/test';

export default class BaseListPage {
  constructor(page, baseUrl, resourcePath) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.resourcePath = resourcePath;
  }

  async goto(path = this.resourcePath) {
    await this.page.goto(this.baseUrl + path);
  }

  createButton() {
    return this.page.getByRole('link', { name: /create/i });
  }

  exportButton() {
    return this.page.getByRole('button', { name: /export/i });
  }

  async isListPresent() {
    try {
      await expect(this.listRoot()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateForm() {
    await this.createButton().click();
  }

  async clickExport() {
    await this.exportButton().click();
  }

  async getItemsCount() {
    return this.items().count();
  }
}