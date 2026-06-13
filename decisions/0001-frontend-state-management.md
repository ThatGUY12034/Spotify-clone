# ADR 0001 — Frontend state management with React Context

- **Date:** 2026-06-13
- **Status:** Accepted

## Context
The frontend needs shared state for (a) auth/user/token and (b) music data + the audio player.
The app is small (a handful of pages) and already depends only on React + react-router. We want
something the existing code style (plain components, hooks) fits without adding a store library.

## Decision
Use the built-in **React Context API** with two providers:
- `UserContext` — token (persisted in `localStorage`), current user, `loginUser`/`registerUser`/`logout`,
  `fetchUser`, and an `isAuth` boolean.
- `SongContext` — albums, songs, currently-selected song, `isPlaying`, and player controls
  (`playSong`, `togglePlay`, `nextSong`, `prevSong`), plus per-album fetch.

No Redux / Zustand / TanStack Query. Data fetching is done with `axios` directly inside the contexts.

## Consequences
- Zero new dependencies; matches the tutorial-level scope.
- If the app grows (caching, optimistic updates, pagination), revisit and consider TanStack Query.
- Player audio element is owned by `SongContext` (via a ref) so any component can control playback.
