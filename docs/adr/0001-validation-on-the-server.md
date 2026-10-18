# 1. The server validates every step; the browser validates too, but only for speed

Status: accepted

## Decision

Each step has one DTO class (`step.dto.ts`) with class-validator rules. A pure function, `applyStep`, runs the DTO
validation and decides the next state: unknown steps and finished sessions are refused, a step beyond the user's
progress is refused (no skipping ahead), earlier steps can be corrected without moving progress backwards, and unknown
fields are rejected (`forbidNonWhitelisted`) instead of silently stored. Input is normalised (trimmed, email
lower-cased, country upper-cased) so stored data is consistent.

The browser repeats the field rules with zod (`apps/web/lib/steps.ts`) so errors appear instantly and a bad step never
makes a network round trip. If the two ever disagree, the server's messages are shown.

## Consequences

- The rules cannot be bypassed from the client. An e2e test attacks the API directly.
- Adding a step is one DTO class on the server plus one entry in the client's `steps` array.
- The rules exist twice, which is the cost of instant feedback. Generating the client schemas from the DTOs (or sharing a
  package) is a possible follow-up.
