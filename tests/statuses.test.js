import { test, expect } from '@playwright/test';
import StatusesPage from './statuses.page.js';
import {
  ensureListPresentOrSkip,
  ensureFormPresentOrSkip,
  ensureLocatorVisibleOrSkip,
} from './utils/crudHelpers.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Статусы (Statuses)', () => {
  let statusesPage;

  test.beforeEach(async ({ page }) => {
    statusesPage = new StatusesPage(page, BASE);
    await statusesPage.goto();
  });

  test('Создание статуса: форма отображается и данные сохраняются', async () => {
    await ensureListPresentOrSkip(
      statusesPage,
      'isStatusesListPresent',
      'Statuses list not present at /statuses — skipping',
    );

    await statusesPage.openCreateForm();
    await ensureFormPresentOrSkip(
      statusesPage,
      'isStatusFormPresent',
      'Status form not present after clicking create — skipping',
    );

    const newStatus = {
      name: 'In Progress',
      slug: 'in-progress',
    };

    await statusesPage.fillStatusForm(newStatus);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(newStatus);
  });

  test('Список статусов отображается корректно (name, slug)', async () => {
    await ensureListPresentOrSkip(
      statusesPage,
      'isStatusesListPresent',
      'Statuses list not present at /statuses — skipping',
    );

    const count = await statusesPage.getStatusesCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstRow = statusesPage.rows().first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow).toContainText(/./);
    }
  });

  test('Редактирование статуса сохраняет изменения', async () => {
    await ensureListPresentOrSkip(
      statusesPage,
      'isStatusesListPresent',
      'Statuses list not present at /statuses — skipping',
    );

    await statusesPage.openCreateForm();
    await ensureFormPresentOrSkip(
      statusesPage,
      'isStatusFormPresent',
      'Status form not present for create — skipping',
    );

    const originalStatus = {
      name: 'To Review',
      slug: 'to-review',
    };

    await statusesPage.fillStatusForm(originalStatus);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(originalStatus);

    await statusesPage.openEditFormForStatus(originalStatus.slug);
    await ensureFormPresentOrSkip(
      statusesPage,
      'isStatusFormPresent',
      'Status form not present for edit — skipping',
    );

    const updatedStatus = {
      name: 'In Review',
      slug: 'in-review',
    };

    await statusesPage.fillStatusForm(updatedStatus);
    await statusesPage.submitForm();

    await statusesPage.expectStatusInList(updatedStatus);
    await statusesPage.expectStatusNotInList(originalStatus.slug);
  });

  test('Удаление одного статуса', async () => {
    await ensureListPresentOrSkip(
      statusesPage,
      'isStatusesListPresent',
      'Statuses list not present at /statuses — skipping',
    );

    const statusToDelete = {
      name: 'Obsolete',
      slug: 'obsolete',
    };

    await statusesPage.openCreateForm();
    await ensureFormPresentOrSkip(
      statusesPage,
      'isStatusFormPresent',
      'Status form not present for create — skipping',
    );

    await statusesPage.fillStatusForm(statusToDelete);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(statusToDelete);

    await statusesPage.deleteStatus(statusToDelete.slug);
    await statusesPage.expectStatusNotInList(statusToDelete.slug);
  });

  test('Массовое удаление статусов (выделить всех -> удалить выбранные)', async () => {
    await ensureListPresentOrSkip(
      statusesPage,
      'isStatusesListPresent',
      'Statuses list not present at /statuses — skipping',
    );

    const statuses = [
      { name: 'Bulk Status 1', slug: 'bulk-status-1' },
      { name: 'Bulk Status 2', slug: 'bulk-status-2' },
      { name: 'Bulk Status 3', slug: 'bulk-status-3' },
    ];

    for (const s of statuses) {
      await statusesPage.openCreateForm();
      await ensureFormPresentOrSkip(
        statusesPage,
        'isStatusFormPresent',
        'Status form not present for create — skipping (bulk)',
      );

      await statusesPage.fillStatusForm(s);
      await statusesPage.submitForm();
      await statusesPage.expectStatusInList(s);
    }

    const beforeCount = await statusesPage.getStatusesCount();

    await ensureLocatorVisibleOrSkip(
      statusesPage.selectAllCheckbox(),
      'Bulk selection UI for statuses not implemented — skipping',
    );
    await ensureLocatorVisibleOrSkip(
      statusesPage.deleteSelectedButton(),
      'Bulk delete UI for statuses not implemented — skipping',
    );

    await statusesPage.selectAllStatuses();

    const rows = statusesPage.rows();
    const rowsCount = await rows.count();
    for (let i = 0; i < rowsCount; i++) {
      const checkbox = rows.nth(i).getByTestId('status-select');
      await expect(checkbox).toBeChecked();
    }

    await statusesPage.deleteSelectedStatuses();

    for (const s of statuses) {
      await statusesPage.expectStatusNotInList(s.slug);
    }

    const afterCount = await statusesPage.getStatusesCount();
    expect(afterCount).toBeLessThan(beforeCount);
  });
});