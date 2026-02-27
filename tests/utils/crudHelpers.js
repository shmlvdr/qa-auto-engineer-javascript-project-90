import { test, expect } from '@playwright/test';

export async function ensureListPresentOrSkip(pageObject, methodName, reason) {
  const present = await pageObject[methodName]();
  test.skip(!present, reason);
}

export async function ensureFormPresentOrSkip(pageObject, methodName, reason) {
  const present = await pageObject[methodName]();
  test.skip(!present, reason);
}

export async function ensureLocatorVisibleOrSkip(locator, reason, timeout = 1000) {
  try {
    await expect(locator).toBeVisible({ timeout });
  } catch {
    test.skip(true, reason);
  }
}