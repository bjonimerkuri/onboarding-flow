import { BadRequestException } from '@nestjs/common';
import { applyStep, SessionState } from './onboarding.rules';

const fresh = (overrides: Partial<SessionState> = {}): SessionState => ({
  currentStep: 1,
  data: {},
  completed: false,
  ...overrides,
});

const reason = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(BadRequestException);
    return (e as BadRequestException).getResponse() as { message: string | string[] };
  }
  throw new Error('expected a BadRequestException');
};

describe('applyStep', () => {
  it('rejects an invalid email with a readable message', async () => {
    const res = await reason(applyStep(fresh(), 1, { fullName: 'Bjoni M', email: 'nope' }));
    expect(res.message).toContain('email must be a valid email address');
  });

  it('collects every error on a step, not just the first', async () => {
    const res = await reason(applyStep(fresh(), 1, { fullName: 'B', email: 'nope' }));
    expect(res.message).toHaveLength(2);
  });

  it('does not allow skipping ahead', async () => {
    const res = await reason(applyStep(fresh({ currentStep: 1 }), 3, { acceptTerms: true }));
    expect(res.message).toBe('Complete the previous steps first');
  });

  it('rejects unknown steps and finished sessions', async () => {
    expect((await reason(applyStep(fresh(), 9, {}))).message).toBe('Unknown step');
    const done = fresh({ completed: true, currentStep: 3 });
    expect((await reason(applyStep(done, 1, { fullName: 'Bjoni M', email: 'b@example.com' }))).message).toBe(
      'Already completed',
    );
  });

  it('rejects unknown fields instead of storing them', async () => {
    const res = await reason(applyStep(fresh(), 1, { fullName: 'Bjoni M', email: 'b@example.com', isAdmin: true }));
    expect(String(res.message)).toContain('isAdmin');
  });

  it('rejects a body that is not an object', async () => {
    await reason(applyStep(fresh(), 1, [1, 2, 3]));
    await reason(applyStep(fresh(), 1, null));
  });

  it('normalises input and advances to the next step', async () => {
    const next = await applyStep(fresh(), 1, { fullName: '  Bjoni M ', email: ' Bjoni@Example.COM ' });
    expect(next.currentStep).toBe(2);
    expect(next.completed).toBe(false);
    expect(next.data.step1).toEqual({ fullName: 'Bjoni M', email: 'bjoni@example.com' });
  });

  it('normalises the country code and rejects non-letters', async () => {
    const ok = await applyStep(fresh({ currentStep: 2 }), 2, { country: 'al', city: 'Tirana' });
    expect(ok.data.step2).toEqual({ country: 'AL', city: 'Tirana' });
    await reason(applyStep(fresh({ currentStep: 2 }), 2, { country: '12', city: 'Tirana' }));
  });

  it('lets a user correct an earlier step without losing progress', async () => {
    const session = fresh({ currentStep: 3, data: { step1: { fullName: 'Old Name', email: 'old@example.com' } } });
    const next = await applyStep(session, 1, { fullName: 'New Name', email: 'new@example.com' });
    expect(next.currentStep).toBe(3);
    expect(next.data.step1).toMatchObject({ fullName: 'New Name' });
  });

  it('completes the session on the last step', async () => {
    const next = await applyStep(fresh({ currentStep: 3 }), 3, { acceptTerms: true });
    expect(next.completed).toBe(true);
    await reason(applyStep(fresh({ currentStep: 3 }), 3, { acceptTerms: false }));
  });
});
