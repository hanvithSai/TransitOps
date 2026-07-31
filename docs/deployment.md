# TransitOps Deployment Guide

**Last updated:** July 31, 2026  
**Status:** Production live · local dev documented

---

## Live URLs

| Service | URL | Host |
|---------|-----|------|
| **Frontend** | https://transitops-han.vercel.app | Vercel |
| **Backend API** | https://transitops-yqkc.onrender.com | Render (Docker) |
| **Health check** | https://transitops-yqkc.onrender.com/api/health | Render |
| **Database** | MongoDB Atlas — cluster `transitops-cluster`, database `transitops` | AWS ap-south-1 (M0) |

**Demo login:** `admin@transitops.com` / `Password@123`

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
| Instance | Free tier (note: ~30–60s cold start after idle) |

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

### npm / corporate registry (Uber unpm)

If `npm run dev` or `npm run seed` opens Uber MFA (`ussh web login`):

- Use `./dev` instead of `npm run dev`
- Use `node seeders/seed.js` instead of `npm run seed`
- Project `.npmrc` sets `registry=https://registry.npmjs.org` and `always-auth=false`

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
