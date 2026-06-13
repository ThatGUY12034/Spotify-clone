# 0004 — Deployment: Vercel (frontend) + Render (backends)

Status: Accepted · 2026-06-13

## Context

We want a free, public live deployment. Vercel is the obvious host for the Vite frontend, but
the three backends are **long-running Express servers** with persistent Mongo/Redis/Postgres
connections — a poor fit for Vercel's per-request serverless functions.

## Decision

- **Frontend → Vercel** (free): static Vite build, root directory `frontend`, SPA rewrite via
  `frontend/vercel.json`. Service URLs come from `VITE_*` env vars set in the Vercel dashboard.
- **3 backends → Render** (free web services): each is a Node web service with
  `npm install --include=dev && npm run build` (TS needs the dev types) then `npm start`.
  Defined in `render.yaml` (Blueprint) with all secrets as `sync: false`.
- Databases unchanged: MongoDB Atlas, Neon Postgres, Cloudinary.

Step-by-step in `DEPLOY.md`.

## Alternatives considered

- **Everything on Vercel:** rejected — would require rewriting each Express app as serverless
  functions and externalizing all DB connections; large refactor for no benefit here.
- **Railway:** dropped its always-free tier (now trial credits), so not "free" ongoing.
- **Fly.io / Koyeb:** viable but require card on file / more setup than Render for this shape.

## Consequences

- Free Render services **cold-start** after ~15 min idle (~50s first hit). Acceptable for a demo.
- Cross-service auth keeps working: admin service's `User_URL` is set to the deployed
  user-service URL.
- Public repo + previously-exposed keys ⇒ **rotation required** (see `0003`); the deploy guide
  repeats this.
- Atlas must allowlist `0.0.0.0/0` for Render egress.
