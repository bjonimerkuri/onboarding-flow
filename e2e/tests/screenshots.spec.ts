import { test } from '@playwright/test';
import { completeStep1, completeStep2, finish } from './helpers';

// Regenerates the README images: npm run screenshots
test.use({ viewport: { width: 1280, height: 800 } });

test('@screenshots step 1', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'About you' }).waitFor();
  await page.screenshot({ path: 'docs/screenshots/step-1.png' });
});

test('@screenshots step 2', async ({ page }) => {
  await page.goto('/');
  await completeStep1(page);
  await page.screenshot({ path: 'docs/screenshots/step-2.png' });
});

test('@screenshots insights', async ({ page }) => {
  await page.goto('/');
  await completeStep1(page);
  await completeStep2(page);
  await finish(page);
  await page.goto('/insights');
  await page.getByRole('heading', { name: 'Where unfinished sessions stopped' }).waitFor();
  await page.screenshot({ path: 'docs/screenshots/insights.png' });
});
