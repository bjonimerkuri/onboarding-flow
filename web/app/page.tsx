'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Values = Record<string, string | boolean>;
type Field = { name: string; label: string; type?: 'text' | 'email' | 'checkbox' };

const steps: { title: string; fields: Field[] }[] = [
  {
    title: 'About you',
    fields: [
      { name: 'fullName', label: 'Full name' },
      { name: 'email', label: 'Email', type: 'email' },
    ],
  },
  {
    title: 'Where do you live?',
    fields: [
      { name: 'country', label: 'Country code (e.g. AL)' },
      { name: 'city', label: 'City' },
    ],
  },
  {
    title: 'Confirm',
    fields: [{ name: 'acceptTerms', label: 'I accept the terms', type: 'checkbox' }],
  },
];

export default function Onboarding() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedId = localStorage.getItem('onboardingId');
      if (savedId) {
        const res = await fetch(`${API}/onboarding/${savedId}`);
        if (res.ok) {
          const s = await res.json();
          setSessionId(savedId);
          setStep(s.completed ? steps.length : s.currentStep);
          setDone(s.completed);
          setValues(Object.assign({}, ...Object.values(s.data)));
          setLoading(false);
          return;
        }
      }
      const res = await fetch(`${API}/onboarding`, { method: 'POST' });
      const s = await res.json();
      localStorage.setItem('onboardingId', s.id);
      setSessionId(s.id);
      setLoading(false);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    const payload = Object.fromEntries(
      steps[step - 1].fields.map((f) => [
        f.name,
        values[f.name] ?? (f.type === 'checkbox' ? false : ''),
      ]),
    );
    const res = await fetch(`${API}/onboarding/${sessionId}/steps/${step}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      setErrors(Array.isArray(err.message) ? err.message : [err.message]);
      return;
    }
    const s = await res.json();
    if (s.completed) setDone(true);
    else setStep(step + 1);
  }

  if (loading) return <p>Loading…</p>;
  if (done) return <h2>All done. Welcome aboard!</h2>;

  const current = steps[step - 1];
  return (
    <form onSubmit={submit}>
      <p>Step {step} of {steps.length}</p>
      <progress value={step} max={steps.length} style={{ width: '100%' }} />
      <h2>{current.title}</h2>
      {current.fields.map((f) => (
        <label key={f.name} style={{ display: 'block', margin: '12px 0' }}>
          {f.label}
          {f.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={Boolean(values[f.name])}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.checked })}
            />
          ) : (
            <input
              type={f.type ?? 'text'}
              value={String(values[f.name] ?? '')}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          )}
        </label>
      ))}
      {errors.length > 0 && (
        <ul style={{ color: 'crimson' }}>
          {errors.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {step > 1 && <button type="button" onClick={() => setStep(step - 1)}>Back</button>}
        <button type="submit">{step === steps.length ? 'Finish' : 'Next'}</button>
      </div>
    </form>
  );
}
