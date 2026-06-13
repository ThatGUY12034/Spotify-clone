# ADR 0002 — Service URLs via Vite env vars (no gateway yet)

- **Date:** 2026-06-13
- **Status:** Accepted

## Context
There are three backend services on three ports (user 5000, song 8000, admin 7000). The frontend
must call all three. Options: (a) hardcode URLs, (b) put each behind one API gateway/reverse proxy,
(c) configure base URLs via env.

## Decision
Use **Vite env vars** — `VITE_USER_URL`, `VITE_SONG_URL`, `VITE_ADMIN_URL` — read once into a small
`api` helper module that exports an axios instance per service. Defaults point at localhost ports.

No gateway for now (keeps Phase 1 focused on the frontend; a gateway is a backend/infra concern).

## Consequences
- Switching environments (local/staging) is a `.env` change, no code edits.
- CORS must stay enabled on each service (it already is).
- A future API gateway can collapse these to one base URL without touching components — only the
  `api` helper changes. Revisit in Phase 2.
