// Vercel build: compile the API, migrate the database, then build the Next.js app (static export).
// Preview deployments get their own database branch from the Neon integration, so migrating on every
// build is safe. Migrations are transactional and guarded by an advisory lock.
import { execSync } from 'node:child_process';

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
};

run('npm run build -w @onboarding-flow/api');

if (process.env.DATABASE_URL) {
  run('node apps/api/dist/migrate-cli.js');
} else {
  console.warn('DATABASE_URL is not set: skipping migrations. The API will not work until it is configured.');
}

run('npm run build -w @onboarding-flow/web');
