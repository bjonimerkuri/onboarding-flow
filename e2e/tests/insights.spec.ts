import { expect, test } from '@playwright/test';
import { completeStep1, completeStep2, finish } from './helpers';

test('the funnel report reflects a completed session', async ({ page }) => {
  await page.goto('/insights');
  await expect(page.getByRole('heading', { name: 'Funnel insights' })).toBeVisible();
  const before = Number(await page.locator('.kpi', { hasText: 'Completed' }).locator('.kpi-value').innerText());

  await page.goto('/');
  await completeStep1(page);
  await completeStep2(page);
  await finish(page);

  await page.getByRole('link', { name: 'Funnel insights' }).click();
  const completed = page.locator('.kpi', { hasText: 'Completed' }).locator('.kpi-value');
  await expect(completed).toHaveText(String(before + 1));
  await expect(page.getByRole('heading', { name: 'Where unfinished sessions stopped' })).toBeVisible();
});
