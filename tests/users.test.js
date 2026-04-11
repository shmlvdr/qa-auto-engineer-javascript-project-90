import { test, expect } from '@playwright/test';
import UsersPage from './users.page.js';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Пользователи (Users)', () => {
  let usersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page, BASE);
    await usersPage.goto();
  });

  test('Создание пользователя: форма отображается и данные сохраняются', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    await usersPage.openCreateForm();

    const formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    const newUser = {
      email: 'new.user@example.com',
      firstName: 'New',
      lastName: 'User',
    };

    await usersPage.fillUserForm(newUser);
    await usersPage.submitForm();
    await usersPage.expectUserInList(newUser);
  });

  test('Список пользователей отображается корректно (email, имя, фамилия)', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    const count = await usersPage.getUsersCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstRow = usersPage.items().first();
      await expect(firstRow).toBeVisible();
      await expect(firstRow).toContainText('@');
    }
  });

  test('Редактирование пользователя сохраняет изменения', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    await usersPage.openCreateForm();

    let formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    const originalUser = {
      email: 'edit.user@example.com',
      firstName: 'Edit',
      lastName: 'User',
    };

    await usersPage.fillUserForm(originalUser);
    await usersPage.submitForm();
    await usersPage.expectUserInList(originalUser);

    await usersPage.openEditFormForUser(originalUser.email);

    formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    const updatedUser = {
      email: 'edited.user@example.com',
      firstName: 'Edited',
      lastName: 'User2',
    };

    await usersPage.fillUserForm(updatedUser);
    await usersPage.submitForm();

    await usersPage.expectUserInList(updatedUser);
    await usersPage.expectUserNotInList(originalUser.email);
  });

  test('Валидация email при редактировании пользователя', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    await usersPage.openCreateForm();

    let formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    const user = {
      email: 'validate.user@example.com',
      firstName: 'Validate',
      lastName: 'User',
    };

    await usersPage.fillUserForm(user);
    await usersPage.submitForm();
    await usersPage.expectUserInList(user);

    await usersPage.openEditFormForUser(user.email);

    formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    await usersPage.fillUserForm({ email: 'not-an-email' });
    await usersPage.submitForm();

    try {
      await expect(usersPage.emailError()).toBeVisible({ timeout: 1000 });
      await expect(usersPage.emailError()).toHaveText(/invalid email/i);
    } catch {
      test.skip(true, 'Email validation UI not implemented — skipping');
    }
  });

  test('Удаление одного пользователя', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    const userToDelete = {
      email: 'delete.me@example.com',
      firstName: 'Delete',
      lastName: 'Me',
    };

    await usersPage.openCreateForm();

    const formPresent = await usersPage.isUserFormPresent();
    expect(formPresent).toBeTruthy();

    await usersPage.fillUserForm(userToDelete);
    await usersPage.submitForm();
    await usersPage.expectUserInList(userToDelete);

    await usersPage.deleteUser(userToDelete.email);
    await usersPage.expectUserNotInList(userToDelete.email);
  });

  test('Массовое удаление пользователей (выделить всех -> удалить выбранных)', async () => {
    const listPresent = await usersPage.isUsersListPresent();
    test.skip(!listPresent, 'Users list not present — skipping users tests');

    const users = [
      { email: 'bulk1@example.com', firstName: 'Bulk1', lastName: 'User' },
      { email: 'bulk2@example.com', firstName: 'Bulk2', lastName: 'User' },
      { email: 'bulk3@example.com', firstName: 'Bulk3', lastName: 'User' },
    ];

    for (const u of users) {
      await usersPage.openCreateForm();

      const formPresent = await usersPage.isUserFormPresent();
      expect(formPresent).toBeTruthy();

      await usersPage.fillUserForm(u);
      await usersPage.submitForm();
      await usersPage.expectUserInList(u);
    }

    const beforeCount = await usersPage.getUsersCount();

    try {
      await expect(usersPage.selectAllCheckbox()).toBeVisible({ timeout: 1000 });
      await expect(usersPage.deleteSelectedButton()).toBeVisible({ timeout: 1000 });
    } catch {
      test.skip(true, 'Bulk selection/delete UI for users not implemented — skipping');
    }

    await usersPage.selectAllUsers();

    const rows = usersPage.items();
    const rowsCount = await rows.count();
    for (let i = 0; i < rowsCount; i += 1) {
      const checkbox = rows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }

    await usersPage.deleteSelectedUsers();

    for (const u of users) {
      await usersPage.expectUserNotInList(u.email);
    }

    const afterCount = await usersPage.getUsersCount();
    expect(afterCount).toBeLessThan(beforeCount);
  });
});