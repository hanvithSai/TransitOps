# TransitOps Frontend

React 19 + Vite 8 SPA for the TransitOps fleet operations platform.

## Setup

```bash
nvm use                # Node 20.20.2+ (see .nvmrc)
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # http://localhost:5173
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
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

## Node version

Requires **Node.js ≥ 20.19** (Vite 8 / ESLint 10). CI uses **Node.js 22**. See `.nvmrc`.

## CI

Included in GitHub Actions `frontend-ci` job: `npm test` → `npm run lint` → `npm run build`.

## Documentation

See `/docs/technical.md` §11 and `/docs/style-guide.md` for architecture and UI conventions.
