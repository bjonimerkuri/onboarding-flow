import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { OnboardingSession } from './onboarding.entity';
import { STEP_DTOS, TOTAL_STEPS } from './step.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingSession)
    private readonly repo: Repository<OnboardingSession>,
  ) {}

  create() {
    return this.repo.save(this.repo.create());
  }

  async get(id: string) {
    const session = await this.repo.findOneBy({ id });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async saveStep(id: string, step: number, payload: Record<string, unknown>) {
    const Dto = STEP_DTOS[step];
    if (!Dto) throw new BadRequestException('Unknown step');

    const session = await this.get(id);
    if (session.completed) throw new BadRequestException('Already completed');
    if (step > session.currentStep) {
      throw new BadRequestException('Complete the previous steps first');
    }

    const instance = plainToInstance(Dto, payload);
    const errors = await validate(instance, { whitelist: true });
    if (errors.length) {
      throw new BadRequestException(
        errors.flatMap((e) => Object.values(e.constraints ?? {})),
      );
    }

    session.data = { ...session.data, [`step${step}`]: instance };
    if (step === TOTAL_STEPS) {
      session.completed = true;
    } else {
      session.currentStep = Math.max(session.currentStep, step + 1);
    }
    return this.repo.save(session);
  }

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
      .getRawMany();

    return {
      total,
      completed,
      completionRate: total ? completed / total : 0,
      droppedAtStep: rows.map((r) => ({
        step: Number(r.step),
        count: Number(r.count),
      })),
    };
  }
}
