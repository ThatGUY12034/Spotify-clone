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
  Add is idempotent; remove 404s if absent. Typechecks clean (`tsc --noEmit`).
  CAVEAT: not exercised end-to-end — needs a live MongoDB + a logged-in user.
- ✅ Secrets hygiene: `git init` + clean initial commit; root `.gitignore` ignores
  `node_modules/`, `dist/`, all `.env`; committed `*.env.example` templates for every service.
  Verified no real `.env` is tracked (`git check-ignore`). Secrets never entered history.
  ⏸️ Key ROTATION is a manual provider-dashboard step — see `decisions/0003`.
- ✅ Admin UI in frontend (`/admin`, gated by `role === "admin"`, link in Navbar for admins):
  add album, add song (with album select), upload/replace song thumbnail, delete album/song.
  Added `SongContext.reload()` so the library refreshes after changes. Verified: build clean,
  route guard redirects non-admins, page renders live albums/songs (temporary gate-bypass screenshot).
  CAVEAT: create/delete happy-path is unverified end-to-end — admin auth needs a live MongoDB.

## Environment status (smoke test, 2026-06-13)
- ✅ Neon Postgres — reachable, has seed data (2 albums, 5 songs).
- ✅ Cloudinary — asset URLs (images + audio) load fine.
- ❌ MongoDB Atlas cluster `cluster0.qssjlbz` — DNS ENOTFOUND (dead/deleted). Blocks user auth.
- ❌ Redis (`redis-12234...redislabs.com`) — DNS ENOTFOUND (dead). App degrades gracefully now.
  → To exercise auth, point `user service/.env` MONGO_URI at a live MongoDB.

## Notes
- Ports: user 5000, song 8000, admin 7000, frontend 5173.
- Decisions logged in `decisions/0001`, `decisions/0002`.
