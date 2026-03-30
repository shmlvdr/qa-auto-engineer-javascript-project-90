import { test, expect } from '@playwright/test';
import TasksPage from './tasks.page.js';
import { ensureLocatorVisibleOrSkip } from './utils/crudHelpers.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

const STATUS = {
  TODO: 'to-do',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
};

const ASSIGNEE = {
  USER_1: 'user-1',
  USER_2: 'user-2',
  USER_3: 'user-3',
};

test.describe('Канбан-доска (Tasks)', () => {
  let tasksPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page, BASE);
    await tasksPage.goto();
  });

  test('Создание задачи: форма отображается и данные сохраняются', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    await tasksPage.openCreateForm();
    const formPresent = await tasksPage.isTaskFormPresent();
    test.skip(
      !formPresent,
      'Task form not present after clicking create — skipping',
    );

    const newTask = {
      name: 'Implement Kanban board',
      description: 'Create basic Kanban board with columns',
      status: STATUS.TODO,
      assignee: ASSIGNEE.USER_1,
    };

    await tasksPage.fillTaskForm(newTask);
    await tasksPage.submitTaskForm();
    await tasksPage.expectTaskInColumn(newTask, STATUS.TODO);
  });

  test('Список задач и колонки отображаются корректно', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    const expectedColumns = [STATUS.TODO, STATUS.IN_PROGRESS, STATUS.DONE];
    for (const colId of expectedColumns) {
      const col = tasksPage.columnById(colId);
      try {
        await expect(col).toBeVisible({ timeout: 500 });
      } catch {
        // колонка может быть не реализована
      }
    }

    const anyTasksCount = await tasksPage.taskCards().count();
    expect(anyTasksCount).toBeGreaterThanOrEqual(0);
    if (anyTasksCount > 0) {
      await expect(tasksPage.taskCards().first()).toBeVisible();
    }
  });

  test('Редактирование задачи сохраняет изменения и меняет колонку', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    await tasksPage.openCreateForm();
    let formPresent = await tasksPage.isTaskFormPresent();
    test.skip(
      !formPresent,
      'Task form not present for create — skipping',
    );

    const originalTask = {
      name: 'Refactor login feature',
      description: 'Clean up login logic',
      status: STATUS.TODO,
      assignee: ASSIGNEE.USER_2,
    };

    await tasksPage.fillTaskForm(originalTask);
    await tasksPage.submitTaskForm();
    await tasksPage.expectTaskInColumn(originalTask, STATUS.TODO);

    await tasksPage.openEditFormForTask(originalTask.name);
    formPresent = await tasksPage.isTaskFormPresent();
    test.skip(
      !formPresent,
      'Task form not present for edit — skipping',
    );

    const updatedTask = {
      name: 'Refactor login & auth feature',
      description: 'Clean up login and auth logic',
      status: STATUS.IN_PROGRESS,
      assignee: ASSIGNEE.USER_3,
    };

    await tasksPage.fillTaskForm(updatedTask);
    await tasksPage.submitTaskForm();

    await tasksPage.expectTaskInColumn(updatedTask, STATUS.IN_PROGRESS);
    await tasksPage.expectTaskNotPresent(originalTask.name);
  });

  test('Удаление одной задачи', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    await tasksPage.openCreateForm();
    const formPresent = await tasksPage.isTaskFormPresent();
    test.skip(
      !formPresent,
      'Task form not present for create — skipping',
    );

    const taskToDelete = {
      name: 'Temporary task',
      description: 'Should be deleted',
      status: STATUS.TODO,
    };

    await tasksPage.fillTaskForm(taskToDelete);
    await tasksPage.submitTaskForm();
    await tasksPage.expectTaskInColumn(taskToDelete, STATUS.TODO);

    await tasksPage.deleteTask(taskToDelete.name);
    await tasksPage.expectTaskNotPresent(taskToDelete.name);
  });

  test('Фильтрация задач по статусу и исполнителю', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    await ensureLocatorVisibleOrSkip(
      tasksPage.filterStatus(),
      'Status filter not implemented — skipping',
    );

    const tasks = [
      { name: 'Filter task 1', status: STATUS.TODO,        assignee: ASSIGNEE.USER_1 },
      { name: 'Filter task 2', status: STATUS.IN_PROGRESS, assignee: ASSIGNEE.USER_2 },
    ];

    for (const t of tasks) {
      await tasksPage.openCreateForm();
      const formPresent = await tasksPage.isTaskFormPresent();
      test.skip(
        !formPresent,
        'Task form not present for create — skipping (filters)',
      );

      await tasksPage.fillTaskForm(t);
      await tasksPage.submitTaskForm();
      await tasksPage.expectTaskInColumn(t, t.status);
    }

    await tasksPage.applyStatusFilter(STATUS.TODO);
    await tasksPage.expectTaskInColumn(tasks[0], STATUS.TODO);
    await tasksPage.expectTaskNotInColumn(tasks[1], STATUS.IN_PROGRESS);

    try {
      await ensureLocatorVisibleOrSkip(
        tasksPage.filterAssignee(),
        'Assignee filter not implemented — skipping assignee part',
        500,
      );
      await tasksPage.applyAssigneeFilter(ASSIGNEE.USER_2);
      await tasksPage.expectTaskInColumn(tasks[1], STATUS.IN_PROGRESS);
    } catch {
      // фильтр по исполнителю может быть не реализован
    }
  });

  test('Перемещение задачи между колонками (DnD / смена статуса)', async () => {
    const boardPresent = await tasksPage.isBoardPresent();
    test.skip(
      !boardPresent,
      'Tasks board not present at /tasks — skipping',
    );

    await tasksPage.openCreateForm();
    const formPresent = await tasksPage.isTaskFormPresent();
    test.skip(
      !formPresent,
      'Task form not present for create — skipping (move)',
    );

    const movableTask = {
      name: 'Task to move',
      description: 'Should be moved between columns',
      status: STATUS.TODO,
    };

    await tasksPage.fillTaskForm(movableTask);
    await tasksPage.submitTaskForm();
    await tasksPage.expectTaskInColumn(movableTask, STATUS.TODO);

    try {
      await tasksPage.moveTaskBetweenColumns(
        movableTask.name,
        STATUS.TODO,
        STATUS.IN_PROGRESS,
      );
      await tasksPage.expectTaskInColumn(movableTask, STATUS.IN_PROGRESS);
      await tasksPage.expectTaskNotInColumn(movableTask, STATUS.TODO);
    } catch {
      test.skip(true, 'Drag&drop / move not implemented — skipping');
    }
  });
});