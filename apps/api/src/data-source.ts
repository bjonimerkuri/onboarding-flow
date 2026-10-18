import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './config';
import { InitSchema1730000000000 } from './migrations/1730000000000-init-schema';
import { OnboardingSession } from './onboarding/onboarding.entity';

// Managed Postgres (Neon) requires TLS and advertises it with sslmode in the URL.
const needsSsl = /sslmode=(require|verify-ca|verify-full)/.test(config.databaseUrl);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: config.databaseUrl,
  ssl: needsSsl ? { rejectUnauthorized: true } : false,
  entities: [OnboardingSession],
  migrations: [InitSchema1730000000000],
  // Schema changes ship as migrations. synchronize stays off everywhere.
  synchronize: false,
  // Serverless functions can fan out, so keep each instance's pool small.
  extra: { max: process.env.VERCEL ? 3 : 10, idleTimeoutMillis: 10_000 },
};

export const AppDataSource = new DataSource(dataSourceOptions);
