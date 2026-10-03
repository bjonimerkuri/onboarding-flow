# Onboarding Flow (Next.js + NestJS + PostgreSQL)

A multi-step onboarding flow with a backend that validates each step, saves progress so users can resume later, and exposes a funnel endpoint showing where people drop off.

Built to practice the full product loop: UI, API, validation, persistence and measurement.

## Stack
- **Web:** Next.js (App Router), React, TypeScript
- **API:** NestJS, TypeORM, class-validator
- **DB:** PostgreSQL (Docker)
- **Tests:** Jest (service unit tests)

## Run locally
```bash
docker compose up -d                 # PostgreSQL
cd api && npm install && npm run start:dev   # http://localhost:3001
cd web && npm install && npm run dev         # http://localhost:3000
cd api && npm test                           # unit tests
```

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/onboarding` | Start a session |
| GET | `/onboarding/:id` | Load progress (resume) |
| PATCH | `/onboarding/:id/steps/:step` | Validate and save one step |
| GET | `/onboarding/stats/funnel` | Completion rate and drop-off per step |

## Decisions
- Validation lives on the server (class-validator DTO per step), so the rules can't be bypassed from the client.
- Steps can't be skipped: the API rejects a step beyond the user's current progress.
- Progress is stored as JSONB per step, so adding a step needs no schema change.
- `synchronize: true` is for the demo only; production should use migrations.

