import { expect } from '@playwright/test';

export default class BaseListPage {
  constructor(page, baseUrl, config) {
    this.page = page;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.config = config;

    this.listRoot = () => this.page.getByTestId(config.listTestId);
    this.rows = () => this.page.getByTestId(config.rowTestId);
    this.createButton = () => this.page.getByTestId(config.createButtonTestId);
  }

  async goto(path) {
    await this.page.goto(this.baseUrl + path);
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

  async getRowByKeyText(keyText) {
    return this.rows().filter({ hasText: keyText });
  }

  async expectInList(keyText, otherTexts = []) {
    const row = await this.getRowByKeyText(keyText);
    await expect(row).toBeVisible();
    for (const t of otherTexts) {
      if (t) {
        await expect(row).toContainText(t);
      }
    }
  }

  async expectNotInList(keyText) {
    const row = await this.getRowByKeyText(keyText);
    await expect(row).toHaveCount(0);
  }

  async getItemsCount() {
    return await this.rows().count();
  }
}