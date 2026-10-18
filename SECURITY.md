# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Use GitHub's
[private vulnerability reporting](../../security/advisories/new) on this repository and include steps to reproduce.
You can expect an acknowledgement within a few days.

## Scope notes

This is a portfolio project. The demo deployment uses throwaway accounts and sample data, and the demo password is
public. Known trade-offs (for example, anonymous sessions identified by an unguessable UUID kept in `localStorage`) are documented in
[docs/adr/0003-anonymous-sessions.md](docs/adr/0003-anonymous-sessions.md).
