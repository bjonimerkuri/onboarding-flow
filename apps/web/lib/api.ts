export interface Session {
  id: string;
  currentStep: number;
  data: Record<string, Record<string, unknown>>;
  completed: boolean;
}

export interface Funnel {
  total: number;
  completed: number;
  completionRate: number;
  totalSteps: number;
  droppedAtStep: { step: number; count: number }[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages.join(', '));
  }
}

// Same-origin in every environment: proxied by `next dev`, rewritten to the function on Vercel.
const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, ['Cannot reach the server. Check your connection and try again.']);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message ?? 'Something went wrong. Try again.';
    throw new ApiError(res.status, Array.isArray(message) ? message : [message]);
  }
  return res.json() as Promise<T>;
}

export const api = {
  createSession: () => request<Session>('/onboarding', { method: 'POST' }),
  getSession: (id: string) => request<Session>(`/onboarding/${id}`),
  saveStep: (id: string, step: number, body: Record<string, unknown>) =>
    request<Session>(`/onboarding/${id}/steps/${step}`, { method: 'PATCH', body: JSON.stringify(body) }),
  funnel: () => request<Funnel>('/onboarding/stats/funnel'),
};

const KEY = 'onboarding-flow.session';
export const sessionStore = {
  read: () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  write: (id: string) => {
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* private mode: the flow still works, it just cannot be resumed */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
