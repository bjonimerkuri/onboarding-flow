'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, Funnel } from '@/lib/api';

export default function Insights() {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setFunnel(await api.funnel());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDropped = Math.max(1, ...(funnel?.droppedAtStep.map((d) => d.count) ?? [0]));

  return (
    <div className="insights">
      <div className="page-head">
        <h1>Funnel insights</h1>
        <button type="button" className="quiet" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      {funnel ? (
        <>
          <div className="kpis">
            <div className="card kpi">
              <p className="kpi-value">{Math.round(funnel.completionRate * 100)}%</p>
              <p className="muted">Completion rate</p>
            </div>
            <div className="card kpi">
              <p className="kpi-value">{funnel.completed}</p>
              <p className="muted">Completed</p>
            </div>
            <div className="card kpi">
              <p className="kpi-value">{funnel.total}</p>
              <p className="muted">Started</p>
            </div>
          </div>

          <section className="card" aria-labelledby="drop-h">
            <h2 id="drop-h">Where unfinished sessions stopped</h2>
            <p className="muted small">The step each unfinished session is currently on.</p>
            <ul className="bars">
              {funnel.droppedAtStep.map((d) => (
                <li key={d.step} className="bar-row">
                  <span>Step {d.step}</span>
                  <span className="bar-track" aria-hidden="true">
                    <span className="bar-fill" style={{ width: `${(d.count / maxDropped) * 100}%` }} />
                  </span>
                  <span className="bar-value">{d.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        !error && (
          <p className="status" role="status">
            Loading…
          </p>
        )
      )}
    </div>
  );
}
