### Hexlet tests and linter status:

[![Actions Status](https://github.com/shmlvdr/qa-auto-engineer-javascript-project-90/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/shmlvdr/qa-auto-engineer-javascript-project-90/actions)
![CI](https://github.com/shmlvdr/qa-auto-engineer-javascript-project-90/actions/workflows/ci.yml/badge.svg)

# Testing a Kanban Board (JS) (QA Auto Engineer JavaScript Project 90)

## Description

Task Manager is a task management system similar to http://www.redmine.org/. It allows you to create tasks, assign assignees, and change task statuses. To use the system, you need to register and authenticate.

The application offers the following main features:

Task management: Users can create new tasks, assign assignees, change task statuses (e.g., "in progress," "draft," "done"), edit, and delete tasks.
User management: Administrators can create new users and view a list of existing users.
Label management: Users can create and edit labels for tasks, such as "bug", "feature", etc.
Task status management: Administrators can create and edit task statuses that define columns on the Kanban board, such as "draft", "in progress", etc.
The playwright library is used for testing the application, which allows for automated interaction with the interface.

## Requirements

- **Node.js**: Version 14.x and above
- **Operating system**: Windows, macOS or any Unix-like system

## Command

1. Initialization of the project:

   ```bash
   npm create vite@latest . -- --template react

   ```

2. Installing the app:

   ```bash
   npm i @hexlet/testing-task-manager

   ```

3. Iaunching the app:
   ```bash
   npm run dev
   ```

4. Installation Playwright:
   ```bash
   npm install -D playwright
   ```

5. Starting testing:
   ```bash
   npx playwright test
   ```

Contribution
If you have any ideas for improvement, please create a pull request or open an issue.

Feedback
If you have any questions or problems, you can contact me by email: daria1807@gmail.com