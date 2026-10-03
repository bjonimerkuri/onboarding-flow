import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OnboardingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 1 })
  currentStep: number;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, unknown>;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
