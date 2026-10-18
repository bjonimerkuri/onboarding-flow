import { expect, test } from '@playwright/test';

// The server enforces the rules even when the UI is bypassed entirely.
test.describe('API rules', () => {
  test('refuses to skip ahead and reports every error on a step', async ({ request }) => {
    const { id } = await (await request.post('/api/onboarding')).json();

    const skipped = await request.patch(`/api/onboarding/${id}/steps/3`, { data: { acceptTerms: true } });
    expect(skipped.status()).toBe(400);
    expect((await skipped.json()).message).toBe('Complete the previous steps first');

    const invalid = await request.patch(`/api/onboarding/${id}/steps/1`, { data: { fullName: 'B', email: 'nope' } });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).message).toHaveLength(2);
  });
});
