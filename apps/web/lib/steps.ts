import { z } from 'zod';

export type Values = Record<string, string | boolean>;

export interface Field {
  name: string;
  label: string;
  hint?: string;
  type: 'text' | 'email' | 'checkbox';
  autoComplete?: string;
}

export interface StepDefinition {
  title: string;
  /** Short label for the progress list. */
  label: string;
  blurb: string;
  fields: Field[];
  schema: z.ZodType;
}

/**
 * Client-side rules give instant feedback. They mirror the server's DTOs, which remain the source of truth:
 * the API re-validates every step and the UI shows its messages if the two ever disagree.
 */
export const steps: StepDefinition[] = [
  {
    title: 'About you',
    label: 'About you',
    blurb: 'So we know who to welcome.',
    fields: [
      { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    ],
    schema: z.object({
      fullName: z.string().trim().min(2, 'Enter your full name (at least 2 characters)').max(100),
      email: z.string().trim().email('Enter a valid email address').max(254),
    }),
  },
  {
    title: 'Where do you live?',
    label: 'Location',
    blurb: 'Used to tailor what you see.',
    fields: [
      { name: 'country', label: 'Country', hint: '2-letter code, for example AL', type: 'text', autoComplete: 'country' },
      { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
    ],
    schema: z.object({
      country: z.string().trim().regex(/^[A-Za-z]{2}$/, 'Use a 2-letter country code, for example AL'),
      city: z.string().trim().min(2, 'Enter your city').max(100),
    }),
  },
  {
    title: 'Confirm',
    label: 'Confirm',
    blurb: 'One last thing before you start.',
    fields: [{ name: 'acceptTerms', label: 'I accept the terms', type: 'checkbox' }],
    schema: z.object({
      acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms to continue' }) }),
    }),
  },
];

/** Field name to message for the first problem on each field. */
export function validateStep(step: StepDefinition, payload: Values): Record<string, string> {
  const result = step.schema.safeParse(payload);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export function payloadFor(step: StepDefinition, values: Values): Values {
  return Object.fromEntries(step.fields.map((f) => [f.name, values[f.name] ?? (f.type === 'checkbox' ? false : '')]));
}

/** Rebuilds form values from the data the server saved per step. */
export function valuesFromSession(data: Record<string, Record<string, unknown>>): Values {
  const merged: Values = {};
  for (const stepData of Object.values(data)) {
    for (const [key, value] of Object.entries(stepData ?? {})) {
      if (typeof value === 'string' || typeof value === 'boolean') merged[key] = value;
    }
  }
  return merged;
}
