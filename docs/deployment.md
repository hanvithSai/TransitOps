# TransitOps Deployment Guide

**Last updated:** August 2, 2026  
**Status:** Production live · UptimeRobot keep-warm · frontend cold-start UX

---

## Live URLs

| Service | URL | Host |
|---------|-----|------|
| **Frontend** | https://transitops-han.vercel.app | Vercel |
| **Backend API** | https://transitops-yqkc.onrender.com | Render (Docker) |
| **Health check** | https://transitops-yqkc.onrender.com/api/health | Render |
| **Database** | MongoDB Atlas — cluster `transitops-cluster`, database `transitops` | AWS ap-south-1 (M0) |

---

## Architecture

```
Browser
  └── Vercel (React SPA, static build)
        └── HTTPS → Render (Express API, Docker)
              └── MongoDB Atlas (transitops database)
```

- **Frontend:** Vite build → `dist/` → Vercel (`frontend/` root, `vercel.json` SPA rewrites)
- **Backend:** `backend/Dockerfile` (Node 20 Alpine) → Render Web Service
- **Database:** Atlas M0 replica set (supports trip dispatch transactions)

---

## Environment Matrix

### Frontend

| File | When used | `VITE_API_URL` |
|------|-----------|----------------|
| `.env.development` | `npm run dev` / `./dev` | `http://localhost:5000/api` |
| `.env.production` | `npm run build` (Vercel) | `https://transitops-yqkc.onrender.com/api` |
| `.env` | Local override (gitignored) | Usually same as development |

Vite bakes `VITE_API_URL` into the production bundle at build time.

### Backend — local (`backend/.env`)

| Variable | Example |
|----------|---------|
| `MONGO_URI` | `mongodb+srv://USER:PASS@transitops-cluster....mongodb.net/transitops?retryWrites=true&w=majority` |
| `JWT_SECRET` | Strong random string (≥ 16 chars) |
| `CLIENT_URL` | `http://localhost:5173` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `NODE_ENV` | `development` |
| `PASSWORD_POLICY_ENFORCEMENT` | `true` (or `false` for demo) |

`JWT_REFRESH_SECRET` is **not used** — refresh tokens are random bytes stored in MongoDB.

### Backend — Render (production)

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Same Atlas URI with `/transitops` database name |
| `JWT_SECRET` | Same as local (or unique prod secret) |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://transitops-han.vercel.app` (exact origin, no trailing slash) |
| `PASSWORD_POLICY_ENFORCEMENT` | `false` (recommended for demo logins) |
| `SMTP_*` / `FROM_*` | Optional — password-reset emails |

### MongoDB Atlas

1. Create cluster (M0 free tier works — includes replica set)
2. Database user with read/write on `transitops`
3. **Network Access:** allow `0.0.0.0/0` (required for Render)
4. Connection string must include database name: `...mongodb.net/transitops?...`
5. Seed once: `cd backend && node seeders/seed.js`

---

## Platform Setup

### Render (backend)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Runtime | **Docker** |
| Branch | `main` |
| Health Check Path | `/api/health` |
| Instance | Free tier (note: ~30–60s cold start after idle; mitigated — see below) |

**Production Express config:** `backend/app.js` sets `app.set('trust proxy', 1)` when `NODE_ENV=production`. Required behind Render’s reverse proxy so `express-rate-limit` reads `X-Forwarded-For` correctly (avoids `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` in logs).

### Vercel (frontend)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable in Vercel dashboard is **optional** — production URL is committed in `frontend/.env.production`. Override in Vercel only if the Render URL changes.

---

## Local Development

Run **both** services:

```bash
# Terminal 1 — backend (port 5000)
cd backend
./dev                    # or: node server.js

# Terminal 2 — frontend (port 5173+)
cd frontend
./dev                    # or: npm run dev
```

Open http://localhost:5173 (Vite uses next port if 5173 is busy).

### Stale JWT on localhost

If login fails after switching prod ↔ local, clear **Local Storage** → `accessToken` in DevTools, or use an incognito window.

---

## Cross-Origin Auth (production)

Frontend (Vercel) and API (Render) are on different domains:

- **CORS:** Backend allows origins from `CLIENT_URL` / `FRONTEND_URL` (comma-separated supported)
- **Refresh cookies:** `SameSite=None; Secure` in production (`authController.js`)
- **Access tokens:** Stored in `localStorage`, sent via `Authorization: Bearer`

After changing Vercel URL, update Render `CLIENT_URL` and redeploy.

---

## Render cold starts (free tier)

Render free-tier web services **spin down after ~15 minutes** of no traffic. The next request can take **~30–60 seconds** while the container starts.

### Mitigation 1 — UptimeRobot (recommended for demos)

Use [UptimeRobot](https://uptimerobot.com) (free plan) to ping the health endpoint on a schedule so the service stays warm.

| Setting | Value |
|---------|-------|
| Monitor type | HTTP(s) |
| URL | `https://transitops-yqkc.onrender.com/api/health` |
| Interval | **10 minutes** (production monitor — under Render’s ~15 min idle window) |
| Timeout | 30–60s (allows cold-start wake-up on first check after long idle) |

Each ping is a real HTTP request. If the Render service is spun down, **that request starts the backend** (cold start ~30–60s on the waking ping; ~100ms once already running). A 10-minute interval keeps traffic arriving before the idle timeout in normal operation.

**Optional:** UptimeRobot free plan also supports **5-minute** intervals for extra margin if you prefer.

**Verify:** Browser or `curl` should return HTTP 200:

```json
{ "success": true, "status": "ok", "database": "connected" }
```

HTTP **503** with `"database": "disconnected"` means MongoDB/Atlas is unreachable — fix `MONGO_URI` and Atlas Network Access before UptimeRobot will show **Up**.

**Limits:**

- Does **not** guarantee zero cold starts (deploys, missed pings, Render policy changes).
- Free Render **compute hours** (~750/month) are consumed faster when the service stays awake.
- Monitor **only active demo backends** — don’t keep every side project warm on one account.

### Mitigation 2 — Frontend resilience

The production SPA handles slow or unavailable APIs without falling back to mock data:

| Feature | Location | Behaviour |
|---------|----------|-----------|
| Health warm-up | `AuthContext` → `warmBackend()` | Pings `/api/health` on app load |
| Status banner | `BackendStatusBanner` | Global banner: connecting / slow / offline + Retry |
| Session loading | `SessionLoadingScreen` | Cold-start messaging during auth restore |
| Login hint | `LoginPage` | Info alert while server is starting |
| Long timeout | `api.js` | 90s prod / 30s dev |
| GET retries | `api.js` | Up to 2 retries (5s apart) on network errors |
| Mock fallback | `api.js` | **Development only** — production shows real errors |

See `docs/technical.md` §11.3 and `docs/style-guide.md` §9.11–9.12.

### Mitigation 3 — Paid Render tier

Upgrade to Render **Starter** or higher for always-on instances (no spin-down). Best option for real users beyond demos.

---

## Docker Compose (alternative local full stack)

From repo root:

```bash
docker compose up --build
```

- API: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB replica set on port 27017

Use when you want local MongoDB instead of Atlas.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main` — independent of Vercel/Render deploys. Both platforms auto-deploy from `main` when connected to GitHub.

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| `readme.md` | Quick start |
| `docs/technical.md` | API reference, env vars, CORS |
| `docs/Engineering.md` | Stack and architecture decisions |
| `docs/validation.md` | Production readiness checklist |
| `docs/mock_data.md` | Seeder credentials |
