import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('onboarding_session')
export class OnboardingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Furthest step the user is allowed to submit. */
  @Column({ default: 1 })
  currentStep: number;

  /** Saved data per step, e.g. { step1: {...}, step2: {...} }. */
  @Column({ type: 'jsonb', default: {} })
  data: Record<string, unknown>;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
