import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { completeStep1, completeStep2, finish } from './helpers';

test.describe('onboarding flow', () => {
  test('completes all three steps and shows what was saved', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible();
    await expect(page.getByText('Step 1 of 3')).toBeVisible();

    await completeStep1(page);
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    await completeStep2(page);
    await finish(page);

    await expect(page.getByText('bjoni@example.com')).toBeVisible();
    await expect(page.getByText('Tirana, AL')).toBeVisible(); // country code normalised to upper case
    await expect(page.getByText('All steps complete')).toBeVisible();
  });

  test('validates in the browser before calling the API', async ({ page }) => {
    const saves: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'PATCH') saves.push(r.url());
    });

    await page.goto('/');
    await page.getByLabel('Full name').fill('B');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Enter your full name (at least 2 characters)')).toBeVisible();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(saves).toHaveLength(0);

    await page.getByLabel('Full name').fill('Bjoni Murati');
    await page.getByLabel('Email').fill('bjoni@example.com');
    await expect(page.getByText('Enter a valid email address')).toHaveCount(0); // clears as it is fixed
  });

  test('resumes after a reload, on the step the user reached', async ({ page }) => {
    await page.goto('/');
    await completeStep1(page);
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Where do you live?' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByLabel('Full name')).toHaveValue('Bjoni Murati'); // saved data comes back
    await expect(page.getByLabel('Email')).toHaveValue('bjoni@example.com');
  });

  test('lets users go back and correct an earlier step', async ({ page }) => {
    await page.goto('/');
    await completeStep1(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByLabel('Full name').fill('Bjoni M. Murati');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Where do you live?' })).toBeVisible();
  });

  test('requires accepting the terms', async ({ page }) => {
    await page.goto('/');
    await completeStep1(page);
    await completeStep2(page);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByText('You must accept the terms to continue')).toBeVisible();
  });

  test('shows the server’s message when the API rejects a step', async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/onboarding/*/steps/1', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: ['email must be a valid email address'] }),
      }),
    );
    await page.getByLabel('Full name').fill('Bjoni Murati');
    await page.getByLabel('Email').fill('bjoni@example.com'); // passes the client check
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('alert')).toContainText('email must be a valid email address');
    await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible(); // stays on the step
  });

  test('offers a retry when the API is unreachable', async ({ page }) => {
    await page.route('**/api/onboarding', (route) => route.abort());
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'We couldn’t load your progress' })).toBeVisible();

    await page.unroute('**/api/onboarding');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible();
  });

  test('starts a fresh session with “Start over”', async ({ page }) => {
    await page.goto('/');
    await completeStep1(page);
    await completeStep2(page);
    await finish(page);
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveValue('');
  });

  test('the form has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'About you' })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
