# 4. Static-exported Next.js plus a Nest function in one Vercel project

Status: accepted

## Context

The UI is entirely client-rendered: it holds form state and talks to the API. It needs no server rendering, but Next.js
gives routing, metadata and a good developer experience.

## Decision

Production builds use `output: 'export'`, so Vercel serves static files from its CDN. The NestJS API is exported as a
single serverless function (`api/index.js` re-exports `apps/api/dist/serverless.js`), and `vercel.json` rewrites `/api/*`
to it, so the browser talks to one origin: no CORS and no per-environment API URL. In development, `next dev` proxies
`/api` to the Nest process (rewrites are not allowed in export mode, so `next.config.mjs` switches on `NODE_ENV`).

TypeORM loads its driver dynamically, which Vercel's file tracer cannot see, so `serverless.ts` imports `pg` explicitly
and `vercel.json` includes `apps/api/dist/**`.

## Consequences

- One project, one URL, preview deployments that are self-contained (with their own Neon database branch).
- Anything needing SSR later (personalised first paint, nonce-based CSP) means dropping `output: 'export'` and moving to
  the standard Next.js runtime, with the API either rewritten to a second project or ported to route handlers.
- Cold starts include Nest bootstrap and a database connection. Each instance keeps at most three connections.
