// tests/tasks.page.js
import { expect } from '@playwright/test';
import BaseListPage from './pages/baseList.page.js';

export default class TasksPage extends BaseListPage {
  constructor(page, baseUrl = 'http://localhost:5173') {
    super(page, baseUrl, {
      listTestId: 'tasks-board-placeholder',
      rowTestId: 'tasks-row-placeholder',
      createButtonTestId: 'tasks-create-placeholder',
    });

    this.columns = () => this.page.getByTestId('tasks-column');
    this.columnById = (columnId) =>
      this.page.locator(
        `[data-testid="tasks-column"][data-column-id="${columnId}"]`,
      );

    this.taskCards = () => this.page.getByTestId('task-card');
    this.taskCardByName = (name) =>
      this.page.getByTestId('task-card').filter({ hasText: name });

    this.createTaskButton = () => this.page.getByTestId('task-create-button');
    this.taskNameInput = () => this.page.getByTestId('task-name');
    this.taskDescriptionInput = () =>
      this.page.getByTestId('task-description');
    this.taskStatusSelect = () => this.page.getByTestId('task-status');
    this.taskAssigneeSelect = () => this.page.getByTestId('task-assignee');
    this.taskSubmitButton = () => this.page.getByTestId('task-submit');

    this.filterStatus = () => this.page.getByTestId('tasks-filter-status');
    this.filterAssignee = () =>
      this.page.getByTestId('tasks-filter-assignee');
    this.filterLabel = () => this.page.getByTestId('tasks-filter-label');
  }

  async goto(path = '/tasks') {
    // используем реализацию goto из BaseListPage
    await super.goto(path);
  }

  async isBoardPresent() {
    try {
      await expect(this.columns()).toBeVisible({ timeout: 1000 });
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
    const card = column.getByTestId('task-card').filter({ hasText: name });
    await expect(card).toBeVisible();
  }

  async expectTaskNotInColumn({ name }, columnId) {
    const column = this.columnById(columnId);
    const card = column.getByTestId('task-card').filter({ hasText: name });
    await expect(card).toHaveCount(0);
  }

  async openEditFormForTask(name) {
    const card = this.taskCardByName(name);
    const editButton = card.getByTestId('task-edit');
    await editButton.click();
  }

  async deleteTask(name) {
    const card = this.taskCardByName(name);
    const deleteButton = card.getByTestId('task-delete');
    await deleteButton.click();
  }

  async expectTaskNotPresent(name) {
    const card = this.taskCardByName(name);
    await expect(card).toHaveCount(0);
  }

  async getTasksCountInColumn(columnId) {
    const column = this.columnById(columnId);
    return await column.getByTestId('task-card').count();
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
      .getByTestId('task-card')
      .filter({ hasText: name });

    await taskCard.dragTo(targetColumn);
  }
}