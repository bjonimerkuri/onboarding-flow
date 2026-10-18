import { expect, Page } from '@playwright/test';

/** Fills the current step's fields and presses the primary button. */
export async function completeStep1(page: Page) {
  await page.getByLabel('Full name').fill('Bjoni Murati');
  await page.getByLabel('Email').fill('bjoni@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Where do you live?' })).toBeVisible();
}

export async function completeStep2(page: Page) {
  await page.getByLabel('Country').fill('al');
  await page.getByLabel('City').fill('Tirana');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm' })).toBeVisible();
}

export async function finish(page: Page) {
  await page.getByLabel('I accept the terms').check();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome aboard!' })).toBeVisible();
}
