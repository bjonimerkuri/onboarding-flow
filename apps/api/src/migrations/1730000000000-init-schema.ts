import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1730000000000 implements MigrationInterface {
  name = 'InitSchema1730000000000';

  async up(q: QueryRunner): Promise<void> {
    // Progress is JSONB keyed by step, so adding a step needs no schema change.
    await q.query(`
      CREATE TABLE "onboarding_session" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "currentStep" integer NOT NULL DEFAULT 1,
        "data" jsonb NOT NULL DEFAULT '{}',
        "completed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_onboarding_session_step" CHECK ("currentStep" >= 1)
      )`);
    // Supports the funnel report (group unfinished sessions by step).
    await q.query(`CREATE INDEX "IDX_onboarding_session_funnel" ON "onboarding_session" ("completed", "currentStep")`);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "onboarding_session"`);
  }
}
