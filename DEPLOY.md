# Deploying the Spotify Clone (free tier)

**Stack:** frontend → **Vercel** (free), 3 backends → **Render** (free web services).
Databases stay where they are (MongoDB Atlas, Neon Postgres, Cloudinary).

> Free Render web services **sleep after ~15 min idle** and cold-start in ~50s on the next
> request. That's normal for the free tier — the first hit after idle is slow, then it's fast.

---

## 0. Prerequisites
- The repo is on GitHub (see "Push to GitHub" below).
- **MongoDB Atlas → Network Access → add `0.0.0.0/0`** (allow from anywhere) so Render can
  connect. Without this, auth will fail in production.
- Have your env values ready (from the local `.env` files). **Rotate them first if you can** —
  this is a public repo and the old keys were exposed.

## 1. Push to GitHub
```bash
# create an empty PUBLIC repo on github.com first (no README), then:
git remote add origin https://github.com/<you>/spotify-clone.git
git branch -M main
git push -u origin main
```
The `.env` files are gitignored and will **not** be pushed — only `*.env.example` templates.

## 2. Deploy the 3 backends on Render
**Option A — Blueprint (one shot):** Render dashboard → **New + → Blueprint** → pick this repo.
It reads `render.yaml` and creates all three services. Then open each service and fill in the
env vars (they're marked "sync: false", so Render prompts you).

**Option B — Manual (if the Blueprint rejects the spaced folder names):** for each service do
**New + → Web Service → this repo**, then set:

| Service | Root Directory | Build Command | Start Command |
|---|---|---|---|
| user  | `user service`  | `npm install --include=dev && npm run build` | `npm start` |
| song  | `song service`  | `npm install --include=dev && npm run build` | `npm start` |
| admin | `admin service` | `npm install --include=dev && npm run build` | `npm start` |

Leave **PORT unset** — Render injects it and the code already reads `process.env.PORT`.

### Env vars to set on each Render service
- **user service:** `MONGO_URI`, `JWT_SEC`
- **song service:** `DB_URL`, `Redis_Password`
- **admin service:** `DB_URL`, `Cloud_Name`, `Cloud_API_Key`, `Cloud_API_Secret`,
  `Redis_Password`, and `User_URL` = the deployed **user service** URL
  (e.g. `https://spotify-user-service.onrender.com`).

> Deploy the **user service first** so you have its URL for the admin service's `User_URL`.

After deploy you'll have 3 URLs like:
- `https://spotify-user-service.onrender.com`
- `https://spotify-song-service.onrender.com`
- `https://spotify-admin-service.onrender.com`

Smoke-test one: open `https://spotify-song-service.onrender.com/api/v1/album/all` → should
return JSON albums (after the cold start).

## 3. Deploy the frontend on Vercel
Vercel → **Add New → Project → import this repo**, then:
- **Root Directory:** `frontend`
- Framework preset: **Vite** (auto-detected). Build `npm run build`, output `dist`.
- **Environment Variables** (point at your Render URLs):
  - `VITE_USER_URL` = `https://spotify-user-service.onrender.com`
  - `VITE_SONG_URL` = `https://spotify-song-service.onrender.com`
  - `VITE_ADMIN_URL` = `https://spotify-admin-service.onrender.com`
- Deploy. You get a live link like `https://spotify-clone-<you>.vercel.app`.

`vercel.json` already adds the SPA rewrite so routes like `/liked` and `/album/:id` work on refresh.

## 4. Verify the live app
- Home loads albums/songs (first load may be slow — Render waking up).
- Register / log in works (needs the Atlas `0.0.0.0/0` rule from step 0).
- Play a song, like a song → `/liked`.
- Admin: promote your user to `admin` in Atlas, then the **Admin** link + uploads work.

## 5. After it's live — rotate the secrets 🔑
The keys were committed locally and the repo is public. Rotate on each provider dashboard and
update the env vars in Render (see `decisions/0003-secrets-and-git-hygiene.md` for the checklist):
Neon password, Cloudinary key/secret, `JWT_SEC`, and the Mongo user password.

## Notes / gotchas
- **CORS** is wide open (`cors()`) in all services — fine for a demo. Tighten to your Vercel
  origin later if you want.
- **Redis** is dead and its host is hardcoded; the services log a connection error on boot and
  fall back to Postgres. Harmless. To silence it, provision a Redis and set `Redis_Password`,
  or remove the redis client.
- Free Render services cold-start; if you need always-on, that's a paid plan.
