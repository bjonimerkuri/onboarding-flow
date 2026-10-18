import { INestApplication } from '@nestjs/common';
import { createTestApp, http, resetDatabase, startSession, STEP_BODIES, submit } from './helpers';

let app: INestApplication;

beforeAll(async () => {
  app = await createTestApp();
});
beforeEach(() => resetDatabase(app));
afterAll(() => app.close());

describe('onboarding flow', () => {
  it('walks a session from start to completion, saving each step', async () => {
    const id = await startSession(app);
    const fresh = await http(app).get(`/api/onboarding/${id}`);
    expect(fresh.body).toMatchObject({ currentStep: 1, completed: false, data: {} });

    expect((await submit(app, id, 1, STEP_BODIES[1])).body.currentStep).toBe(2);
    expect((await submit(app, id, 2, STEP_BODIES[2])).body.currentStep).toBe(3);
    const done = await submit(app, id, 3, STEP_BODIES[3]);
    expect(done.body.completed).toBe(true);

    const saved = await http(app).get(`/api/onboarding/${id}`);
    expect(saved.body.data).toEqual({
      step1: { fullName: 'Bjoni Murati', email: 'bjoni@example.com' },
      step2: { country: 'AL', city: 'Tirana' },
      step3: { acceptTerms: true },
    });
  });

  it('resumes where the user left off', async () => {
    const id = await startSession(app);
    await submit(app, id, 1, STEP_BODIES[1]);
    const resumed = await http(app).get(`/api/onboarding/${id}`);
    expect(resumed.body.currentStep).toBe(2);
    expect(resumed.body.data.step1.email).toBe('bjoni@example.com');
  });

  it('refuses to skip steps, however the request is made', async () => {
    const id = await startSession(app);
    const res = await submit(app, id, 3, STEP_BODIES[3]);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Complete the previous steps first');
  });

  it('returns every validation error for a step', async () => {
    const id = await startSession(app);
    const res = await submit(app, id, 1, { fullName: 'B', email: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.message).toHaveLength(2);
  });

  it('refuses edits after completion', async () => {
    const id = await startSession(app);
    for (const step of [1, 2, 3] as const) await submit(app, id, step, STEP_BODIES[step]);
    expect((await submit(app, id, 1, STEP_BODIES[1])).status).toBe(400);
  });

  it('answers 404 for an unknown session and 400 for a malformed id or step', async () => {
    expect((await http(app).get('/api/onboarding/6f1c1f0e-8f5d-4d6f-9b0e-1a2b3c4d5e6f')).status).toBe(404);
    expect((await http(app).get('/api/onboarding/not-a-uuid')).status).toBe(400);
    const id = await startSession(app);
    expect((await submit(app, id, 99, {})).status).toBe(400);
    expect((await http(app).patch(`/api/onboarding/${id}/steps/abc`).send({})).status).toBe(400);
  });

  it('keeps two simultaneous submissions of one step consistent', async () => {
    const id = await startSession(app);
    const [a, b] = await Promise.all([submit(app, id, 1, STEP_BODIES[1]), submit(app, id, 1, STEP_BODIES[1])]);
    expect([a.status, b.status]).toEqual([200, 200]);
    expect((await http(app).get(`/api/onboarding/${id}`)).body.currentStep).toBe(2); // not 3
  });
});

describe('funnel report', () => {
  it('reports completion rate and where unfinished sessions stopped', async () => {
    const finished = await startSession(app);
    for (const step of [1, 2, 3] as const) await submit(app, finished, step, STEP_BODIES[step]);
    const stuckAtTwo = await startSession(app);
    await submit(app, stuckAtTwo, 1, STEP_BODIES[1]);
    await startSession(app); // never started step 1
    await startSession(app);

    const res = await http(app).get('/api/onboarding/stats/funnel');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 4, completed: 1, completionRate: 0.25, totalSteps: 3 });
    expect(res.body.droppedAtStep).toEqual([
      { step: 1, count: 2 },
      { step: 2, count: 1 },
      { step: 3, count: 0 },
    ]);
  });

  it('is well-defined with no sessions', async () => {
    const res = await http(app).get('/api/onboarding/stats/funnel');
    expect(res.body).toMatchObject({ total: 0, completed: 0, completionRate: 0 });
  });

  it('answers the health check', async () => {
    expect((await http(app).get('/api/health')).body).toEqual({ status: 'ok' });
  });
});
