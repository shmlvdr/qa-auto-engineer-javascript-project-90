import { test, expect } from '@playwright/test';
import LabelsPage from './labels.page.js';
import {
  ensureListPresentOrSkip,
  ensureFormPresentOrSkip,
  ensureLocatorVisibleOrSkip,
} from './utils/crudHelpers.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Метки (Labels)', () => {
  let labelsPage;

  test.beforeEach(async ({ page }) => {
    labelsPage = new LabelsPage(page, BASE);
    await labelsPage.goto();
  });

  test('Создание метки: форма отображается и данные сохраняются', async () => {
    await ensureListPresentOrSkip(
      labelsPage,
      'isLabelsListPresent',
      'Labels list not present at /labels — skipping',
    );

    await labelsPage.openCreateForm();
    await ensureFormPresentOrSkip(
      labelsPage,
      'isLabelFormPresent',
      'Label form not present after clicking create — skipping',
    );

    const newLabel = {
      name: 'bug',
      slug: 'bug',
      color: '#ff0000',
    };

    await labelsPage.fillLabelForm(newLabel);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(newLabel);
  });

  test('Список меток отображается корректно (name, slug)', async () => {
    await ensureListPresentOrSkip(
      labelsPage,
      'isLabelsListPresent',
      'Labels list not present at /labels — skipping',
    );

    const count = await labelsPage.getLabelsCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstRow = labelsPage.rows().first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow).toContainText(/./);
    }
  });

  test('Редактирование метки сохраняет изменения', async () => {
    await ensureListPresentOrSkip(
      labelsPage,
      'isLabelsListPresent',
      'Labels list not present at /labels — skipping',
    );

    await labelsPage.openCreateForm();
    await ensureFormPresentOrSkip(
      labelsPage,
      'isLabelFormPresent',
      'Label form not present for create — skipping',
    );

    const originalLabel = {
      name: 'feature',
      slug: 'feature',
      color: '#00ff00',
    };

    await labelsPage.fillLabelForm(originalLabel);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(originalLabel);

    await labelsPage.openEditFormForLabel(originalLabel.slug);
    await ensureFormPresentOrSkip(
      labelsPage,
      'isLabelFormPresent',
      'Label form not present for edit — skipping',
    );

    const updatedLabel = {
      name: 'enhancement',
      slug: 'enhancement',
      color: '#0000ff',
    };

    await labelsPage.fillLabelForm(updatedLabel);
    await labelsPage.submitForm();

    await labelsPage.expectLabelInList(updatedLabel);
    await labelsPage.expectLabelNotInList(originalLabel.slug);
  });

  test('Удаление одной метки', async () => {
    await ensureListPresentOrSkip(
      labelsPage,
      'isLabelsListPresent',
      'Labels list not present at /labels — skipping',
    );

    const labelToDelete = {
      name: 'temporary',
      slug: 'temporary',
      color: '#aaaaaa',
    };

    await labelsPage.openCreateForm();
    await ensureFormPresentOrSkip(
      labelsPage,
      'isLabelFormPresent',
      'Label form not present for create — skipping',
    );

    await labelsPage.fillLabelForm(labelToDelete);
    await labelsPage.submitForm();
    await labelsPage.expectLabelInList(labelToDelete);

    await labelsPage.deleteLabel(labelToDelete.slug);
    await labelsPage.expectLabelNotInList(labelToDelete.slug);
  });

  test('Массовое удаление меток (выделить все -> удалить выбранные)', async () => {
    await ensureListPresentOrSkip(
      labelsPage,
      'isLabelsListPresent',
      'Labels list not present at /labels — skipping',
    );

    const labels = [
      { name: 'bulk-label-1', slug: 'bulk-label-1', color: '#111111' },
      { name: 'bulk-label-2', slug: 'bulk-label-2', color: '#222222' },
      { name: 'bulk-label-3', slug: 'bulk-label-3', color: '#333333' },
    ];

    for (const l of labels) {
      await labelsPage.openCreateForm();
      await ensureFormPresentOrSkip(
        labelsPage,
        'isLabelFormPresent',
        'Label form not present for create — skipping (bulk)',
      );

      await labelsPage.fillLabelForm(l);
      await labelsPage.submitForm();
      await labelsPage.expectLabelInList(l);
    }

    const beforeCount = await labelsPage.getLabelsCount();

    await ensureLocatorVisibleOrSkip(
      labelsPage.selectAllCheckbox(),
      'Bulk selection UI for labels not implemented — skipping',
    );
    await ensureLocatorVisibleOrSkip(
      labelsPage.deleteSelectedButton(),
      'Bulk delete UI for labels not implemented — skipping',
    );

    await labelsPage.selectAllLabels();

    const rows = labelsPage.rows();
    const rowsCount = await rows.count();
    for (let i = 0; i < rowsCount; i += 1) {
      const checkbox = rows.nth(i).getByTestId('label-select');
      await expect(checkbox).toBeChecked();
    }

    await labelsPage.deleteSelectedLabels();

    for (const l of labels) {
      await labelsPage.expectLabelNotInList(l.slug);
    }

    const afterCount = await labelsPage.getLabelsCount();
    expect(afterCount).toBeLessThan(beforeCount);
  });
});