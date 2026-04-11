// tests/tasks.page.js
import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class TasksPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, '/tasks');

    this.taskTitleInput = () => this.page.locator('input[name="title"]');
    this.taskContentInput = () => this.page.locator('textarea[name="content"]');

    this.formStatusSelect = () =>
      this.page.locator('div[role="combobox"]').nth(1);
    this.formAssigneeSelect = () =>
      this.page.locator('div[role="combobox"]').nth(2);
    this.formLabelsSelect = () =>
      this.page.locator('div[role="combobox"]').nth(3);

    this.saveButton = () =>
      this.page.getByRole('button', { name: /save/i });
  }

  listRoot() {
    return this.page.locator('.MuiBox-root.css-k008qs');
  }

  items() {
    return this.page.locator('.MuiCard-root');
  }

  async goto(path = '/tasks') {
    await super.goto(path);
  }

  async isBoardPresent() {
    return this.isListPresent();
  }

  async isTaskFormPresent() {
    try {
      await expect(this.taskTitleInput()).toBeVisible({ timeout: 1000 });
      await expect(this.saveButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateForm() {
    await this.createButton().click();
  }

  async fillTaskForm({ name, description, status, assignee }) {
    if (name !== undefined) {
      await this.taskTitleInput().fill(name);
    }
    if (description !== undefined) {
      await this.taskContentInput().fill(description);
    }
    if (status !== undefined) {
      await this.formStatusSelect().click();
      await this.page
        .getByRole('option', { name: new RegExp(status, 'i') })
        .click();
    }
    if (assignee !== undefined) {
      await this.formAssigneeSelect().click();
      await this.page
        .getByRole('option', { name: new RegExp(assignee, 'i') })
        .click();
    }
  }

  async submitTaskForm() {
    await this.saveButton().click();
  }

  columnByTitle(title) {
    return this.page
      .getByRole('heading', { name: new RegExp(`^${title}$`, 'i') })
      .locator('xpath=..')
      .locator('div[data-rfd-droppable-id]');
  }

  cardByTaskTitle(taskTitle) {
    return this.page
      .locator('.MuiCard-root')
      .filter({ has: this.page.getByText(taskTitle) });
  }

  async expectTaskInColumn({ name }, columnTitle) {
    const column = this.columnByTitle(columnTitle);
    await expect(column).toBeVisible();
    const card = column.locator('.MuiCard-root').filter({
      has: this.page.getByText(name),
    });
    await expect(card).toBeVisible();
  }

  async expectTaskNotInColumn({ name }, columnTitle) {
    const column = this.columnByTitle(columnTitle);
    const card = column.locator('.MuiCard-root').filter({
      has: this.page.getByText(name),
    });
    await expect(card).toHaveCount(0);
  }

  async openEditFormForTask(name) {
    const card = this.cardByTaskTitle(name);
    await expect(card).toBeVisible();
    const editLink = card.getByRole('link', { name: /edit/i });
    await editLink.click();
  }

  async expectTaskNotPresent(name) {
    const card = this.cardByTaskTitle(name);
    await expect(card).toHaveCount(0);
  }

  async getTasksCountInColumn(columnTitle) {
    const column = this.columnByTitle(columnTitle);
    return column.locator('.MuiCard-root').count();
  }

  async applyStatusFilter(statusValue) {
    const statusFilter = this.page.locator('div[role="combobox"]').nth(0);
    await statusFilter.click();
    await this.page
      .getByRole('option', { name: new RegExp(statusValue, 'i') })
      .click();
  }

  async applyAssigneeFilter(assigneeValue) {
    const assigneeFilter = this.page.locator('div[role="combobox"]').nth(1);
    await assigneeFilter.click();
    await this.page
      .getByRole('option', { name: new RegExp(assigneeValue, 'i') })
      .click();
  }

  async applyLabelFilter(labelValue) {
    const labelFilter = this.page.locator('div[role="combobox"]').nth(2);
    await labelFilter.click();
    await this.page
      .getByRole('option', { name: new RegExp(labelValue, 'i') })
      .click();
  }

  async moveTaskBetweenColumns(name, fromColumnTitle, toColumnTitle) {
    const sourceColumn = this.columnByTitle(fromColumnTitle);
    const targetColumn = this.columnByTitle(toColumnTitle);
    const card = sourceColumn.locator('.MuiCard-root').filter({
      has: this.page.getByText(name),
    });

    await card.dragTo(targetColumn);
  }
}