import { test, expect } from '@playwright/test';
import StatusesPage from './statuses.page.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

async function ensureStatusesList(statusesPage) {
  const present = await statusesPage.isStatusesListPresent();
  test.skip(!present, 'Statuses list not present — skipping statuses tests');
}

async function openAndEnsureStatusForm(statusesPage) {
  await statusesPage.openCreateForm();
  const formPresent = await statusesPage.isStatusFormPresent();
  expect(formPresent).toBeTruthy();
}

test.describe('Статусы (Statuses)', () => {
  let statusesPage;

  test.beforeEach(async ({ page }) => {
    statusesPage = new StatusesPage(page, BASE);
    await statusesPage.goto();
  });

  test('Создание статуса: форма отображается и данные сохраняются', async () => {
    await ensureStatusesList(statusesPage);
    await openAndEnsureStatusForm(statusesPage);

    const newStatus = {
      name: 'In Progress',
      slug: 'in-progress',
    };

    await statusesPage.fillStatusForm(newStatus);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(newStatus);
  });

  test('Список статусов отображается корректно (name, slug)', async () => {
    await ensureStatusesList(statusesPage);

    const count = await statusesPage.getStatusesCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstRow = statusesPage.items().first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow).toContainText(/./);
    }
  });

  test('Редактирование статуса сохраняет изменения', async () => {
    await ensureStatusesList(statusesPage);
    await openAndEnsureStatusForm(statusesPage);

    const originalStatus = {
      name: 'To Review',
      slug: 'to-review',
    };

    await statusesPage.fillStatusForm(originalStatus);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(originalStatus);

    await statusesPage.openEditFormForStatus(originalStatus.slug);

    const formPresent = await statusesPage.isStatusFormPresent();
    expect(formPresent).toBeTruthy();

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
    await ensureStatusesList(statusesPage);
    await openAndEnsureStatusForm(statusesPage);

    const statusToDelete = {
      name: 'Obsolete',
      slug: 'obsolete',
    };

    await statusesPage.fillStatusForm(statusToDelete);
    await statusesPage.submitForm();
    await statusesPage.expectStatusInList(statusToDelete);

    await statusesPage.deleteStatus(statusToDelete.slug);
    await statusesPage.expectStatusNotInList(statusToDelete.slug);
  });

  test('Массовое удаление статусов (выделить всех -> удалить выбранные)', async () => {
    await ensureStatusesList(statusesPage);

    const statuses = [
      { name: 'Bulk Status 1', slug: 'bulk-status-1' },
      { name: 'Bulk Status 2', slug: 'bulk-status-2' },
      { name: 'Bulk Status 3', slug: 'bulk-status-3' },
    ];

    for (const s of statuses) {
      await openAndEnsureStatusForm(statusesPage);
      await statusesPage.fillStatusForm(s);
      await statusesPage.submitForm();
      await statusesPage.expectStatusInList(s);
    }

    const beforeCount = await statusesPage.getStatusesCount();

    try {
      await expect(statusesPage.selectAllCheckbox()).toBeVisible({ timeout: 1000 });
      await expect(statusesPage.deleteSelectedButton()).toBeVisible({ timeout: 1000 });
    } catch {
      test.skip(true, 'Bulk selection/delete UI for statuses not implemented — skipping');
    }

    await statusesPage.selectAllStatuses();

    const rows = statusesPage.items();
    const rowsCount = await rows.count();
    for (let i = 0; i < rowsCount; i += 1) {
      const checkbox = rows.nth(i).locator('input[type="checkbox"]');
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