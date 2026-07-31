# TransitOps Frontend

React 19 + Vite 8 SPA for the TransitOps fleet operations platform.

## Setup

```bash
npm install
cp .env.example .env   # if present; set VITE_API_URL
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
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |

## Structure

- `src/pages/app/` — Authenticated modules (dashboard, vehicles, trips, etc.)
- `src/pages/auth/` — Login, register, password reset
- `src/components/ui/` — Design system primitives
- `src/components/common/` — Shared Modal, Toast, SelectField
- `src/schemas/` — Zod validation (mirrors backend validators)
- `src/services/api.js` — Axios + JWT refresh + mock fallback

## Node version

Requires **Node.js ≥ 20.19** (Vite 8 / ESLint 10). See `.nvmrc`.

## Documentation

See `/docs/technical.md` §11 and `/docs/style-guide.md` for architecture and UI conventions.
