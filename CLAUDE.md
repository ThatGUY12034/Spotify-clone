# Spotify Clone — Project Guide

A Spotify-style music streaming app built as **3 backend microservices + a React frontend**.

## Architecture

| Service        | Port | Stack                              | Responsibility |
|----------------|------|------------------------------------|----------------|
| user service   | 5000 | Express + MongoDB (Mongoose) + JWT | Register/login, issues JWT, `/user/me`, playlist |
| song service   | 8000 | Express + Neon Postgres + Redis    | Read-only: albums, songs, songs-by-album, single song |
| admin service  | 7000 | Express + Neon Postgres + Redis + Cloudinary | Create/delete albums & songs, upload audio/thumbnails |
| frontend       | 5173 | React 19 + TS + Vite + Tailwind 4 + react-router 7 | UI |

**Auth model:** the user service is the auth authority. The admin service does *not* verify JWTs
itself — its `isAuth` middleware calls `GET {USER_URL}/api/v1/user/me` to validate the token and
fetch the user (must have `role: "admin"`).

**Data split:** users live in MongoDB; albums/songs live in Neon Postgres. Redis caches reads in the
song/admin services (`albums`, `songs`, `album_songs_<id>` keys, 30-min TTL, invalidated on writes).

## Backend API (base path `/api/v1`)

**user service (5000)**
- `POST /user/register` — `{ name, email, password }` → `{ user, token }`
- `POST /user/login` — `{ email, password }` → `{ user, token }`
- `GET  /user/me` — auth (Bearer/`token` header) → user
- `GET    /user/playlist` — auth → `{ playlist: string[] }`
- `POST   /user/playlist/:songId` — auth → add song id (idempotent) → `{ message, playlist }`
- `DELETE /user/playlist/:songId` — auth → remove song id → `{ message, playlist }`

**song service (8000)**
- `GET /album/all` → `{ albums }`
- `GET /song/all` → `{ songs }`
- `GET /album/:id` → `{ album, songs }`
- `GET /song/:id` → `{ song }`

**admin service (7000)** — all require admin auth
- `POST   /album/new` (multipart `file`, `title`, `description`)
- `POST   /song/new` (multipart `file` = audio, `title`, `description`, `album_id`)
- `POST   /song/:id` (multipart `file` = thumbnail)
- `DELETE /album/:id`, `DELETE /song/:id`

## Data shapes

- **User** (Mongo): `{ _id, name, email, role, playlist: string[], createdAt }`
- **Album** (PG): `{ id, title, description, thumbnail, created_at }`
- **Song** (PG): `{ id, title, description, thumbnail, audio, album_id, created_at }`

## Frontend conventions

- Service URLs come from Vite env vars (`VITE_USER_URL`, `VITE_SONG_URL`, `VITE_ADMIN_URL`),
  see `frontend/.env`. Never hardcode ports in components.
- Global state via React Context: `UserContext` (auth/token) and `SongContext` (albums/songs/player).
- JWT is stored in `localStorage` under `token` and sent as `Authorization: Bearer <token>`.
- Tailwind v4 (config-less, `@import "tailwindcss"` in `index.css`). Spotify palette: bg `#121212`,
  panels `#000`, hover `#242424` / `#ffffff26`, accent green `#1db954`.

## Running locally

Each backend service: `npm install` then `npm run dev` (tsc watch + nodemon on `dist/`).
Frontend: `npm install` then `npm run dev`.

## Workflow / project memory

- `task.md` — running checklist of work, current status, and what's next.
- `decisions/` — one markdown file per non-trivial decision (ADR style). Read before changing
  architecture so we don't relitigate settled choices.

## Known backend issues

Resolved in the backend pass (2026-06-13):
- ✅ song service `getAllSongs` undefined-return on Redis-down — now falls back to DB.
- ✅ user service `index.ts` — `app.listen(PORT)`, `connectDb` awaited, survives dead Mongo.
- ✅ Secrets no longer committed: `git init` + `.gitignore` (`*/.env`) + `*.env.example` templates.
  ⚠️ Key ROTATION still pending — manual provider-dashboard step, see `decisions/0003`.
- ✅ Playlist CRUD endpoints added (see user service API above).

Outstanding:
- External services: MongoDB Atlas + Redis are dead (DNS ENOTFOUND). Auth + admin writes
  cannot be exercised until `MONGO_URI` points at a live MongoDB. Neon + Cloudinary are live.
