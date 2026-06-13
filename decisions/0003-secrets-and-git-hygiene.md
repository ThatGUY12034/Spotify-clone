# 0003 — Secrets management & git hygiene

Status: Accepted · 2026-06-13

## Context

The repo had no git history and four `.env` files containing **real, live**
credentials sitting in the working tree:

- `user service/.env` — MongoDB Atlas URI, `JWT_SEC`
- `song service/.env` — Neon Postgres `DB_URL`, Redis password
- `admin service/.env` — Neon `DB_URL`, Cloudinary key/secret, Redis password
- `frontend/.env` — only public `VITE_*` service URLs (not secret)

If these were pushed to a remote as-is, the secrets would leak.

## Decision

1. **`git init`** at the project root and make a clean initial commit.
2. **Root `.gitignore`** ignores `node_modules/`, `dist/`, and every `.env`
   (`*/.env`, `.env`, `.env.*.local`). Verified with `git check-ignore` that no
   real `.env` is tracked — only `*.env.example` templates are committed.
3. **`*.env.example`** committed for every service with placeholder values, so a
   fresh clone documents the required variables without exposing real ones.

Because this is the *initial* commit and `.env` was ignored from the start, the
secrets never entered git history — no history rewrite (`filter-repo`/BFG) is
needed.

## Still required (manual — provider dashboards)

The secrets were in plaintext on disk and two providers are still live, so they
should be **rotated** before any public push:

- [ ] **Neon Postgres** — reset the `neondb_owner` password (or rotate the role);
      update `DB_URL` in `song service/.env` *and* `admin service/.env`.
- [ ] **Cloudinary** — regenerate API key/secret in the console; update
      `admin service/.env`.
- [ ] **Redis** — rotate the password (host is currently dead; rotate when
      re-provisioned).
- [ ] **JWT_SEC** — replace with a long random value
      (`openssl rand -hex 32`); invalidates existing tokens (fine, none are live).
- [ ] **MongoDB** — cluster is dead; when a new one is provisioned, use a fresh
      user/password and never commit it.

## Consequences

- Safe to add a remote and push once rotation above is done.
- New contributors copy `*.env.example` → `.env` and fill in their own values.
