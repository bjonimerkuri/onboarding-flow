'use client';

import { useCallback, useEffect, useState } from 'react';
import { StepForm } from '@/components/StepForm';
import { Stepper } from '@/components/Stepper';
import { api, ApiError, Session, sessionStore } from '@/lib/api';
import { payloadFor, steps, valuesFromSession, Values } from '@/lib/steps';

type Phase = 'loading' | 'failed' | 'form' | 'done';

export default function Onboarding() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [loadError, setLoadError] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const adopt = useCallback((s: Session) => {
    setSession(s);
    setValues(valuesFromSession(s.data));
    setStep(Math.min(s.currentStep, steps.length));
    setPhase(s.completed ? 'done' : 'form');
  }, []);

  // Resume the saved session if it still exists, otherwise start a new one.
  const start = useCallback(async () => {
    setPhase('loading');
    setLoadError('');
    try {
      const savedId = sessionStore.read();
      if (savedId) {
        try {
          return adopt(await api.getSession(savedId));
        } catch (e) {
          if (!(e instanceof ApiError) || e.status === 0) throw e;
          sessionStore.clear(); // the saved session is gone or invalid: fall through to a new one
        }
      }
      const created = await api.createSession();
      sessionStore.write(created.id);
      adopt(created);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
      setPhase('failed');
    }
  }, [adopt]);

  useEffect(() => {
    void start();
  }, [start]);

  async function submit() {
    if (!session) return;
    setSaving(true);
    setServerErrors([]);
    try {
      const updated = await api.saveStep(session.id, step, payloadFor(steps[step - 1], values));
      setSession(updated);
      if (updated.completed) setPhase('done');
      else setStep(step + 1);
    } catch (e) {
      setServerErrors(e instanceof ApiError ? e.messages : ['Something went wrong. Try again.']);
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    sessionStore.clear();
    setValues({});
    setServerErrors([]);
    void start();
  }

  if (phase === 'loading') {
    return (
      <p className="status" role="status">
        Loading…
      </p>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="card narrow">
        <h1>We couldn’t load your progress</h1>
        <p role="alert" className="error-text">
          {loadError}
        </p>
        <button type="button" onClick={() => void start()}>
          Try again
        </button>
      </div>
    );
  }

  const summary = session ? valuesFromSession(session.data) : {};

  return (
    <div className="layout">
      <div className="intro">
        <h1>{phase === 'done' ? 'You’re all set' : 'Let’s get you started'}</h1>
        <p className="lede">Three short steps. Your progress is saved, so you can leave and come back.</p>
        <Stepper current={step} completed={phase === 'done'} />
      </div>

      {phase === 'done' ? (
        <section className="card" aria-labelledby="done-h">
          <h2 id="done-h" tabIndex={-1}>
            Welcome aboard!
          </h2>
          <p className="muted">Here is what we saved:</p>
          <dl className="summary">
            <dt>Name</dt>
            <dd>{String(summary.fullName ?? '')}</dd>
            <dt>Email</dt>
            <dd>{String(summary.email ?? '')}</dd>
            <dt>Location</dt>
            <dd>
              {String(summary.city ?? '')}, {String(summary.country ?? '')}
            </dd>
          </dl>
          <div className="actions">
            <button type="button" className="quiet" onClick={startOver}>
              Start over
            </button>
          </div>
        </section>
      ) : (
        <StepForm
          step={steps[step - 1]}
          stepNumber={step}
          totalSteps={steps.length}
          values={values}
          serverErrors={serverErrors}
          saving={saving}
          onChange={setValues}
          onBack={() => {
            setServerErrors([]);
            setStep(step - 1);
          }}
          onSubmit={() => void submit()}
        />
      )}
    </div>
  );
}
