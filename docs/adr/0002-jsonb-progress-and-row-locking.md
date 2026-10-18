# 2. Progress as JSONB per step, saved under a row lock

Status: accepted

## Decision

A session is one row: `currentStep`, `completed`, and `data` as JSONB keyed by step (`step1`, `step2`, ...). Adding a step
needs no migration. `saveStep` loads the row with a pessimistic write lock inside a transaction, so two tabs (or a double
click) submitting at once are serialised and cannot corrupt progress. An integration test submits the same step twice
concurrently and asserts progress advances exactly once.

The schema is created by a migration (not `synchronize`), including a `CHECK` on `currentStep` and an index that serves the
funnel query.

## Consequences

- Flexible storage, but no relational constraints inside `data`. The DTOs are the schema for that column.
- The funnel report is a single grouped query and always lists every step, including those nobody is stuck on.
