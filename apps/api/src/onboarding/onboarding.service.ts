import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OnboardingSession } from './onboarding.entity';
import { applyStep } from './onboarding.rules';
import { TOTAL_STEPS } from './step.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingSession) private readonly repo: Repository<OnboardingSession>,
    private readonly ds: DataSource,
  ) {}

  create() {
    return this.repo.save(this.repo.create());
  }

  async get(id: string) {
    const session = await this.repo.findOneBy({ id });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  /** Locks the row so two tabs submitting at once cannot interleave and corrupt progress. */
  saveStep(id: string, step: number, payload: unknown) {
    return this.ds.transaction(async (manager) => {
      const session = await manager.findOne(OnboardingSession, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!session) throw new NotFoundException('Session not found');
      Object.assign(session, await applyStep(session, step, payload));
      return manager.save(session);
    });
  }

  /** Completion rate and where unfinished sessions stopped. */
  async funnel() {
    const total = await this.repo.count();
    const completed = await this.repo.countBy({ completed: true });
    const rows = await this.repo
      .createQueryBuilder('s')
      .select('s."currentStep"', 'step')
      .addSelect('COUNT(*)', 'count')
      .where('s.completed = false')
      .groupBy('s."currentStep"')
      .orderBy('s."currentStep"')
      .getRawMany<{ step: string; count: string }>();

    const dropped = new Map(rows.map((r) => [Number(r.step), Number(r.count)]));
    return {
      total,
      completed,
      completionRate: total ? completed / total : 0,
      totalSteps: TOTAL_STEPS,
      // Every step is listed, including those nobody is stuck on, so the UI needs no gap-filling.
      droppedAtStep: Array.from({ length: TOTAL_STEPS }, (_, i) => ({ step: i + 1, count: dropped.get(i + 1) ?? 0 })),
    };
  }
}
