import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class TasksPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, {
      listTestId: 'task-card',              
      rowTestId: 'task-card',                
      createButtonTestId: 'task-create-button', 
    });

    this.columns = () => this.page.locator('[data-testid="tasks-column"]');
    this.columnById = (columnId) =>
      this.page.locator(
        `[data-testid="tasks-column"][data-column-id="${columnId}"]`,
      );
    this.taskCards = () => this.page.locator('[data-testid="task-card"]');
    this.taskCardByName = (name) =>
      this.taskCards().filter({ hasText: name });
    this.createTaskButton = () => this.page.locator('[data-testid="task-create-button"]');
    this.taskNameInput = () => this.page.locator('[data-testid="task-name"]');
    this.taskDescriptionInput = () =>
      this.page.locator('[data-testid="task-description"]');
    this.taskStatusSelect = () => this.page.locator('[data-testid="task-status"]');
    this.taskAssigneeSelect = () => this.page.locator('[data-testid="task-assignee"]');
    this.taskSubmitButton = () => this.page.locator('[data-testid="task-submit"]');
    this.filterStatus = () => this.page.locator('[data-testid="tasks-filter-status"]');
    this.filterAssignee = () =>
      this.page.locator('[data-testid="tasks-filter-assignee"]');
    this.filterLabel = () => this.page.locator('[data-testid="tasks-filter-label"]');
  }

  async goto(path = '/tasks') {
    await super.goto(path);
  }

  async isBoardPresent() {
    try {
      await expect(this.columns().first()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async isTaskFormPresent() {
    try {
      await expect(this.taskNameInput()).toBeVisible({ timeout: 1000 });
      await expect(this.taskStatusSelect()).toBeVisible({ timeout: 1000 });
      await expect(this.taskSubmitButton()).toBeVisible({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async openCreateForm() {
    await this.createTaskButton().click();
  }

  async fillTaskForm({ name, description, status, assignee }) {
    if (name !== undefined) {
      await this.taskNameInput().fill(name);
    }
    if (
      description !== undefined &&
      (await this.taskDescriptionInput().count()) > 0
    ) {
      await this.taskDescriptionInput().fill(description);
    }
    if (status !== undefined) {
      await this.taskStatusSelect().selectOption(status);
    }
    if (
      assignee !== undefined &&
      (await this.taskAssigneeSelect().count()) > 0
    ) {
      await this.taskAssigneeSelect().selectOption(assignee);
    }
  }

  async submitTaskForm() {
    await this.taskSubmitButton().click();
  }

  async expectTaskInColumn({ name }, columnId) {
    const column = this.columnById(columnId);
    await expect(column).toBeVisible();
    const card = column
      .locator('[data-testid="task-card"]')
      .filter({ hasText: name });
    await expect(card).toBeVisible();
  }

  async expectTaskNotInColumn({ name }, columnId) {
    const column = this.columnById(columnId);
    const card = column
      .locator('[data-testid="task-card"]')
      .filter({ hasText: name });
    await expect(card).toHaveCount(0);
  }

  async openEditFormForTask(name) {
    const card = this.taskCardByName(name);
    const editButton = card.locator('[data-testid="task-edit"]');
    await editButton.click();
  }

  async deleteTask(name) {
    const card = this.taskCardByName(name);
    const deleteButton = card.locator('[data-testid="task-delete"]');
    await deleteButton.click();
  }

  async expectTaskNotPresent(name) {
    const card = this.taskCardByName(name);
    await expect(card).toHaveCount(0);
  }

  async getTasksCountInColumn(columnId) {
    const column = this.columnById(columnId);
    return column.locator('[data-testid="task-card"]').count();
  }

  async applyStatusFilter(statusValue) {
    await this.filterStatus().selectOption(statusValue);
  }

  async applyAssigneeFilter(assigneeValue) {
    await this.filterAssignee().selectOption(assigneeValue);
  }

  async applyLabelFilter(labelValue) {
    await this.filterLabel().selectOption(labelValue);
  }

  async moveTaskBetweenColumns(name, fromColumnId, toColumnId) {
    const sourceColumn = this.columnById(fromColumnId);
    const targetColumn = this.columnById(toColumnId);
    const taskCard = sourceColumn
      .locator('[data-testid="task-card"]')
      .filter({ hasText: name });

    await taskCard.dragTo(targetColumn);
  }
}