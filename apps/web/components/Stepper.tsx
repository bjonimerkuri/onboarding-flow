import { steps } from '@/lib/steps';

export function Stepper({ current, completed }: { current: number; completed: boolean }) {
  return (
    <nav aria-label="Progress" className="stepper">
      <p className="stepper-count">{completed ? 'All steps complete' : `Step ${current} of ${steps.length}`}</p>
      <ol>
        {steps.map((s, i) => {
          const n = i + 1;
          const state = completed || n < current ? 'done' : n === current ? 'current' : 'todo';
          return (
            <li key={s.label} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="marker" aria-hidden="true">
                {state === 'done' ? (
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </span>
              <span>
                <span className="step-label">{s.label}</span>
                <span className="step-blurb">{s.blurb}</span>
                <span className="visually-hidden">{state === 'done' ? ' (completed)' : state === 'current' ? ' (current step)' : ''}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
