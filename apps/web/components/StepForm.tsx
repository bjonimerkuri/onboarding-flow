'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { payloadFor, StepDefinition, validateStep, Values } from '@/lib/steps';

interface Props {
  step: StepDefinition;
  stepNumber: number;
  totalSteps: number;
  values: Values;
  serverErrors: string[];
  saving: boolean;
  onChange: (values: Values) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepForm({ step, stepNumber, totalSteps, values, serverErrors, saving, onChange, onBack, onSubmit }: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // A new step starts clean, and keyboard and screen-reader users land on its heading.
  useEffect(() => {
    setTouched({});
    setSubmitted(false);
    heading.current?.focus();
  }, [stepNumber]);

  const errors = validateStep(step, payloadFor(step, values));
  const show = (name: string) => (submitted || touched[name] ? errors[name] : undefined);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onSubmit();
  }

  const isLast = stepNumber === totalSteps;
  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2 ref={heading} tabIndex={-1}>
        {step.title}
      </h2>

      {step.fields.map((f) => {
        const error = show(f.name);
        const id = `field-${f.name}`;
        const describedBy = [f.hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
        return (
          <div key={f.name} className={f.type === 'checkbox' ? 'field field-check' : 'field'}>
            {f.type === 'checkbox' ? (
              <label htmlFor={id} className="check">
                <input
                  id={id}
                  type="checkbox"
                  checked={Boolean(values[f.name])}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => onChange({ ...values, [f.name]: e.target.checked })}
                />
                <span>{f.label}</span>
              </label>
            ) : (
              <>
                <label htmlFor={id}>{f.label}</label>
                {f.hint && (
                  <span id={`${id}-hint`} className="hint">
                    {f.hint}
                  </span>
                )}
                <input
                  id={id}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  value={String(values[f.name] ?? '')}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                />
              </>
            )}
            {error && (
              <span id={`${id}-error`} className="field-error">
                {error}
              </span>
            )}
          </div>
        );
      })}

      <div aria-live="polite">
        {serverErrors.length > 0 && (
          <ul className="error" role="alert">
            {serverErrors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="actions">
        {stepNumber > 1 && (
          <button type="button" className="quiet" onClick={onBack} disabled={saving}>
            Back
          </button>
        )}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isLast ? 'Finish' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
