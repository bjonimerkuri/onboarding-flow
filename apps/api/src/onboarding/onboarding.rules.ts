import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { STEP_DTOS, TOTAL_STEPS } from './step.dto';

export interface SessionState {
  currentStep: number;
  data: Record<string, unknown>;
  completed: boolean;
}

/**
 * Validates one step and returns the session's next state. Pure apart from validation: the service
 * decides how to load and persist it. Rules:
 *  - the step must exist and the session must not be finished;
 *  - a step beyond the user's progress is refused (no skipping ahead);
 *  - earlier steps may be resubmitted to correct them, without moving progress backwards;
 *  - unknown fields are rejected rather than silently stored.
 */
export async function applyStep(session: SessionState, step: number, payload: unknown): Promise<SessionState> {
  const Dto = STEP_DTOS[step];
  if (!Dto) throw new BadRequestException('Unknown step');
  if (session.completed) throw new BadRequestException('Already completed');
  if (step > session.currentStep) throw new BadRequestException('Complete the previous steps first');
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new BadRequestException('Request body must be a JSON object');
  }

  const instance = plainToInstance(Dto, payload);
  const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length) {
    throw new BadRequestException(errors.flatMap((e) => Object.values(e.constraints ?? {})));
  }

  const data = { ...session.data, [`step${step}`]: { ...instance } };
  if (step === TOTAL_STEPS) return { currentStep: session.currentStep, data, completed: true };
  return { currentStep: Math.max(session.currentStep, step + 1), data, completed: false };
}
