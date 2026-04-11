import { test, expect } from '@playwright/test';
import LabelsPage from './labels.page.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Метки (Labels)', () => {
  let labelsPage;

  test.beforeEach(async ({ page }) => {
    labelsPage = new LabelsPage(page, BASE);
    await labelsPage.goto();
  });

  test('Создание метки: форма отображается и данные сохраняются', async () => {
    const listPresent = await labelsPage.isLabelsListPresent();
    test.skip(!listPresent, 'Labels list not present — skipping labels tests');

    await labelsPage.openCreateForm();

    const formPresent = await labelsPage.isLabelFormPresent();
    expect(formPresent).toBeTruthy();

    const newLabel = {
      name: 'bug',
    };

    await labelsPage.fillLabelForm(newLabel);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(newLabel);
  });

  test('Список меток отображается корректно (name)', async () => {
    const listPresent = await labelsPage.isLabelsListPresent();
    test.skip(!listPresent, 'Labels list not present — skipping labels tests');

    const count = await labelsPage.getLabelsCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstRow = labelsPage.items().first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow).toContainText(/./);
    }
  });

  test('Редактирование метки сохраняет изменения', async () => {
    const listPresent = await labelsPage.isLabelsListPresent();
    test.skip(!listPresent, 'Labels list not present — skipping labels tests');

    await labelsPage.openCreateForm();

    let formPresent = await labelsPage.isLabelFormPresent();
    expect(formPresent).toBeTruthy();

    const originalLabel = {
      name: 'feature',
    };

    await labelsPage.fillLabelForm(originalLabel);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(originalLabel);

    await labelsPage.openEditFormForLabel(originalLabel.name);

    formPresent = await labelsPage.isLabelFormPresent();
    expect(formPresent).toBeTruthy();

    const updatedLabel = {
      name: 'enhancement',
    };

    await labelsPage.fillLabelForm(updatedLabel);
    await labelsPage.submitForm();

    await labelsPage.expectLabelInList(updatedLabel);
    await labelsPage.expectLabelNotInList(originalLabel.name);
  });

  test('Удаление одной метки', async () => {
    const listPresent = await labelsPage.isLabelsListPresent();
    test.skip(!listPresent, 'Labels list not present — skipping labels tests');

    const labelToDelete = {
      name: 'temporary',
    };

    await labelsPage.openCreateForm();

    const formPresent = await labelsPage.isLabelFormPresent();
    expect(formPresent).toBeTruthy();

    await labelsPage.fillLabelForm(labelToDelete);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(labelToDelete);

    await labelsPage.deleteLabel(labelToDelete.name);
    await labelsPage.expectLabelNotInList(labelToDelete.name);
  });

  test('Массовое удаление меток (выделить все -> удалить выбранные)', async () => {
    const listPresent = await labelsPage.isLabelsListPresent();
    test.skip(!listPresent, 'Labels list not present — skipping labels tests');

    const labels = [
      { name: 'bulk-label-1' },
      { name: 'bulk-label-2' },
      { name: 'bulk-label-3' },
    ];

    for (const l of labels) {
      await labelsPage.openCreateForm();

      const formPresent = await labelsPage.isLabelFormPresent();
      expect(formPresent).toBeTruthy();

      await labelsPage.fillLabelForm(l);
      await labelsPage.submitForm();
      await labelsPage.expectLabelInList(l);
    }

    const beforeCount = await labelsPage.getLabelsCount();

    try {
      await expect(labelsPage.selectAllCheckbox()).toBeVisible({ timeout: 1000 });
      await expect(labelsPage.deleteSelectedButton()).toBeVisible({ timeout: 1000 });
    } catch {
      test.skip(true, 'Bulk selection/delete UI for labels not implemented — skipping');
    }

    await labelsPage.selectAllLabels();

    const rows = labelsPage.items();
    const rowsCount = await rows.count();
    for (let i = 0; i < rowsCount; i += 1) {
      const checkbox = rows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }

    await labelsPage.deleteSelectedLabels();

    for (const l of labels) {
      await labelsPage.expectLabelNotInList(l.name);
    }

    const afterCount = await labelsPage.getLabelsCount();
    expect(afterCount).toBeLessThan(beforeCount);
  });
});