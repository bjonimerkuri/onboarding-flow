# Contributing

## Setup

```bash
nvm use                 # Node 20
docker compose up -d    # PostgreSQL (creates the onboarding and onboarding_test databases)
npm ci
npm run db:migrate
npm run dev             # API on :3001 (Swagger UI at /api/docs), web on :3000
```

## Before you push

```bash
npm run check           # format, lint, typecheck, unit tests, build
npm run test:int        # API tests against a real database
npm run e2e             # Playwright; starts the API and web app for you
```

## Conventions

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- **Schema changes:** add a new TypeORM migration in `apps/api/src/migrations`, register it in `data-source.ts`, and never edit one that has shipped. `synchronize` stays off.
- **Step rules** live in one DTO class per step (`apps/api/src/onboarding/step.dto.ts`) and the pure `applyStep` function (`onboarding.rules.ts`), with unit tests. The browser keeps a zod copy in `apps/web/lib/steps.ts` for instant feedback; the server stays the source of truth.
- **Accessibility:** every interactive element needs a visible label and a visible focus state. The e2e suite runs axe on
  key pages.
