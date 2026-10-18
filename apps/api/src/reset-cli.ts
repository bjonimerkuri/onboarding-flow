import 'reflect-metadata';
import { config } from './config';
import { AppDataSource } from './data-source';

// Wipes all sessions. Used by the e2e suite. Never runs in production.
async function main() {
  if (config.isProd) throw new Error('db:reset is disabled in production');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations({ transaction: 'each' });
  await AppDataSource.query('TRUNCATE onboarding_session');
  console.log('Database reset');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => AppDataSource.isInitialized && AppDataSource.destroy());
