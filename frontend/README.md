# TransitOps Frontend

React 19 + Vite 8 SPA for the TransitOps fleet operations platform.

**Production:** https://transitops-han.vercel.app

## Setup

```bash
nvm use                # Node 20.20.2+ (see .nvmrc)
npm install
./dev                  # http://localhost:5173
```

If `npm run dev` opens Uber MFA login, use `./dev` instead (bypasses npm).

If `./dev` fails with `styleText` / Node version errors, your shell is on an older Node (e.g. 20.11). `./dev` auto-uses a locally installed `.nvmrc` version when present. Otherwise:

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
./dev
```

Requires **backend running** on port 5000 (`cd backend && ./dev`).

## Environment

| File | `VITE_API_URL` | Used when |
|------|----------------|-----------|
| `.env.development` | `http://localhost:5000/api` | Local dev (`./dev`) |
| `.env.production` | `https://transitops-yqkc.onrender.com/api` | Vercel build |
| `.env` | Optional local override | Gitignored |

See `/docs/deployment.md` for full prod/dev matrix.

## Scripts

| Command | Description |
|---------|-------------|
| `./dev` | Development server with HMR (preferred locally) |
| `npm run dev` | Same via npm (may trigger corporate MFA) |
| `npm run build` | Production build (`dist/`) |
| `npm run lint` | ESLint (runs in CI) |
| `npm test` | Vitest — smoke tests for `ProtectedRoute` |
| `npm run preview` | Preview production build |

## Structure

- `src/pages/app/` — Authenticated modules (dashboard, vehicles, trips, etc.)
- `src/pages/auth/` — Login, register, password reset
- `src/components/ui/` — Design system primitives
- `src/components/common/` — Shared Modal, Toast, SelectField
- `src/schemas/` — Zod validation (mirrors backend validators)
- `src/services/api.js` — Axios + JWT refresh + mock fallback
- `src/test/setup.js` — Vitest + Testing Library setup
- `vercel.json` — SPA rewrites + build settings for Vercel

## Node version

Requires **Node.js ≥ 20.19** (Vite 8 / ESLint 10). CI uses **Node.js 22**. See `.nvmrc`.

## CI & Deployment

- **CI:** GitHub Actions `frontend-ci` — `npm test` → `npm run lint` → `npm run build`
- **Deploy:** Vercel auto-deploys from `main` (root: `frontend/`)

## Documentation

See `/docs/deployment.md`, `/docs/technical.md` §11, and `/docs/style-guide.md`.
