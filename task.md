# Task Tracker

Status legend: ⬜ todo · 🟡 in progress · ✅ done · ⏸️ deferred

## Phase 1 — Complete the frontend ✅ DONE (2026-06-13)

### Setup
- ✅ Add `frontend/.env` + `.env.example` with `VITE_USER_URL`, `VITE_SONG_URL`, `VITE_ADMIN_URL`
- ✅ Add axios instances / API helper per service (`src/api.ts`, `src/types.ts`)
- ✅ Remove bogus `router-dom` dependency from `package.json`

### State (React Context)
- ✅ `UserContext` — register, login, logout, fetch `/user/me`, token persistence, `isAuth`
- ✅ `SongContext` — fetch albums + songs, fetch album-with-songs, player state
  (selected song, queue, isPlaying, play/pause, next/prev, shared `<audio>` ref)

### Routing & pages
- ✅ `App.tsx` routes: `/`, `/login`, `/register`, `/album/:id`, redirect unknown → `/`,
  auth pages redirect to `/` when already logged in
- ✅ `Login` page — wired to UserContext
- ✅ `Register` page — wired to UserContext
- ✅ `Home` page — album grid + song grid from SongContext
- ✅ `Album` page — album header + track list, click to play

### Components
- ✅ `Player` — real `<audio>` player: play/pause, seek bar, time, volume, prev/next, auto-next on end
- ✅ `AlbumCard` / `SongCard` — clickable cards with hover play button
- ✅ Fix `PlaylistCard` (was internally named `Player`; now takes an album prop)
- ✅ `Navbar` — Login/Signup vs. greeting+Logout based on auth
- ✅ `Sidebar` — renders real albums, links to `/album/:id`
- ✅ Loading + empty states on Home/Album

### Verify
- ✅ `npm run build` (tsc + vite) passes clean — no type errors, no warnings
- ✅ Smoke-test against live backends: Home renders 2 real albums + 5 songs from Neon;
  clicking a song plays the real Cloudinary MP3 (player shows 0:05 / 3:57); console clean.

## Phase 2 — Backend pass (NEXT)
- ✅ Fix song service `getAllSongs` undefined-return bug (now falls back to DB when Redis down;
  also normalized `getAllAlbums` response shape + removed dead `return` in `getAllSongsOfAlbum`)
- ✅ Fix user service: no longer crashes on Mongo failure (await + try/catch + `connection.on("error")`);
  `app.listen(port)` now respects `PORT`; `connectDb` awaited. Verified: process survives dead Mongo,
  `/` stays up, login returns a clean JSON error instead of crashing.
- ✅ Playlist CRUD endpoints (user service): `GET /user/playlist`, `POST /user/playlist/:songId`,
  `DELETE /user/playlist/:songId` — all `isAuth`-gated, operate on the `playlist: string[]` field.
  Add is idempotent; remove 404s if absent. VERIFIED end-to-end (2026-06-13, see below).
- ✅ Secrets hygiene: `git init` + clean initial commit; root `.gitignore` ignores
  `node_modules/`, `dist/`, all `.env`; committed `*.env.example` templates for every service.
  Verified no real `.env` is tracked (`git check-ignore`). Secrets never entered history.
  ⏸️ Key ROTATION is a manual provider-dashboard step — see `decisions/0003`.
- ✅ Admin UI in frontend (`/admin`, gated by `role === "admin"`, link in Navbar for admins):
  add album, add song (with album select), upload/replace song thumbnail, delete album/song.
  Added `SongContext.reload()` so the library refreshes after changes. Verified: build clean,
  route guard redirects non-admins, page renders live albums/songs (temporary gate-bypass screenshot).
  Admin create/delete VERIFIED end-to-end (2026-06-13) once MongoDB came back — see below.

## Phase 3 — Playlist UI (frontend)
- ✅ Wired the playlist endpoints into the UI:
  - `UserContext` now holds `playlist: string[]` (hydrated from `/user/me`), with
    `isInPlaylist()` and an optimistic `togglePlaylist()` (reverts on failure).
  - `SongCard` shows a heart toggle (filled green when liked), only when logged in.
  - New `Liked` page at `/liked` (auth-gated) listing liked songs; sidebar link with count.
  VERIFIED in-browser (2026-06-13): like → heart fills + server playlist `["9"]`; Liked Songs
  page shows it; unlike → empty state + server playlist `[]`; console clean; build 112 modules.

## End-to-end test (2026-06-13) — 20/20 passed ✅

After the user restarted the MongoDB Atlas cluster (now live; Redis still dead), ran a full
harness against all three live services. Read paths (Neon), auth (Mongo), playlist CRUD, the
admin 403 guard, and a real admin create→verify→delete album round-trip (Cloudinary upload +
Neon insert/delete) all passed. DB restored to original state (test users cleaned up).
Note: stale service instances from earlier in the session (started while Mongo was dead) had
to be killed first — they held the ports with dead Mongo connections (buffering timeouts).

## Environment status (smoke test, 2026-06-13)
- ✅ Neon Postgres — reachable, has seed data (2 albums, 5 songs).
- ✅ Cloudinary — asset URLs (images + audio) load fine.
- ❌ MongoDB Atlas cluster `cluster0.qssjlbz` — DNS ENOTFOUND (dead/deleted). Blocks user auth.
- ❌ Redis (`redis-12234...redislabs.com`) — DNS ENOTFOUND (dead). App degrades gracefully now.
  → To exercise auth, point `user service/.env` MONGO_URI at a live MongoDB.

## Notes
- Ports: user 5000, song 8000, admin 7000, frontend 5173.
- Decisions logged in `decisions/0001`, `decisions/0002`.
