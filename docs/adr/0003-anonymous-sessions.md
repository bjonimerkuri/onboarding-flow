# 3. Anonymous sessions, and the trade-offs

Status: accepted, with known limitations

## Decision

Onboarding happens before an account exists, so a session is identified only by its UUID, which the browser keeps in
`localStorage` to allow resuming. Version 4 UUIDs are unguessable, so the id works as a capability token. There is no
cookie, so there is nothing to forge across sites.

## Known limitations

- Anyone holding the id can read and edit that session. Fine for a demo; for real PII, bind the session to a signed
  cookie or to the account created at the end.
- Session creation is rate limited (60 per 10 minutes per IP), but the limiter is in memory and therefore per
  serverless instance. A shared store (Upstash Redis or Postgres) would make it global.
- `GET /api/onboarding/stats/funnel` is public and returns only aggregate counts. Protect it before showing real data.
- The Content-Security-Policy allows inline scripts because a static Next.js export emits inline bootstrap code. A
  nonce-based policy requires server rendering.
