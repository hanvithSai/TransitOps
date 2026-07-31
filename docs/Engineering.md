# Engineering Documentation

**Last updated:** July 31, 2026 (post P4 hardening + CI green)

## Engineering Decisions

* **Monorepo structure:** `frontend/` and `backend/` separated for clear concerns while sharing one repository.
* **REST API:** Express 5 exposes JSON REST endpoints consumed by the React SPA.
* **JWT authentication:** Access tokens (localStorage) + httpOnly refresh cookies; bcrypt (12 rounds) for passwords.
* **Role-based access control (RBAC):** Route-level enforcement via `authorize()` middleware using role names. The `Role.permissions` array is stored but not yet enforced programmatically.
* **Mongoose ODM:** Schema validation, references, indexes, and middleware for MongoDB.
* **Layered backend:** `routes → controllers → services → models` with `express-validator` at the route layer.
* **Client form validation:** React Hook Form + Zod schemas in `frontend/src/schemas/` mirror backend validators.
* **Background jobs:** `node-cron` runs daily license-expiry suspension (midnight IST), skipping drivers on active dispatched trips.
* **Security middleware:** `helmet()` on all responses; `express-rate-limit` on `/api/auth/*`; user search input escaped via `utils/escapeRegex.js`.
* **Session security:** JWT access tokens include `pwdAt` (password change timestamp); invalidated in `authenticate` after reset. Refresh tokens rotate on each `/auth/refresh`.
* **Trip dispatch:** MongoDB transactions in `tripService.dispatchTrip` (requires replica-set MongoDB).
* **Audit trail:** Mutations logged via `auditMiddleware`; admin read API at `GET /api/audit-logs` with filter UI on Users page.
* **Operations:** Docker Compose (MongoDB replica set + API + nginx frontend), `GET /api/health`, SIGTERM graceful shutdown, startup env validation.
* **Demo fallback:** Frontend `api.js` serves aligned `mockData.js` on network error or 5xx only (auth endpoints excluded).

## Tech Stack

### Frontend

| Package | Purpose |
|---------|---------|
| React 19 | UI library |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling with design tokens |
| React Router v7 | Client-side routing |
| Recharts | Dashboard charts |
| Axios | HTTP client with JWT refresh interceptor |
| React Hook Form | Form state management |
| Zod + `@hookform/resolvers` | Client-side validation |
| Lucide React | Icons |
| Vitest + Testing Library | Frontend smoke tests (`ProtectedRoute.test.jsx`) |

### Backend

| Package | Purpose |
|---------|---------|
| Express 5 | HTTP server |
| Mongoose 9 | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | Access token signing |
| express-validator | Request validation |
| node-cron | Scheduled jobs |
| nodemailer | Password-reset emails |
| helmet | HTTP security headers |
| express-rate-limit | Auth endpoint rate limiting |
| Jest + Supertest | API tests — 8 suites: `rbac`, `authRegister`, `authForgotPassword`, `escapeRegex`, `tripDispatch`, `trip`, `report`, `driver` |

## Key Directories

```
backend/
  controllers/   # HTTP handlers
  services/      # Business logic
  models/        # Mongoose schemas
  routes/        # Route definitions + RBAC
  validators/    # express-validator rules
  utils/         # cronJobs, errorHandler, sendEmail, escapeRegex, pagination, validateEnv
  seeders/       # Demo data seeder
  tests/         # Jest tests (8 suites / 53 tests)
  app.js         # Express app (routes, middleware, health)
  server.js      # DB connect, cron, graceful shutdown

frontend/src/
  pages/app/     # Authenticated app pages
  pages/auth/    # Login, register, password reset
  components/ui/ # Design system primitives
  components/common/  # Shared Modal, Toast, SelectField
  schemas/       # Zod validation schemas
  contexts/      # AuthContext
  hooks/         # useDebounce (search)
  services/      # api.js, mockData.js
  test/          # Vitest setup
```

## Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Access token signing |
| `CLIENT_URL` | Backend (CORS) | Allowed frontend origin |
| `FRONTEND_URL` | Backend (auth emails) | Password-reset link base URL |
| `SMTP_*` / `FROM_*` | Backend | Email delivery |
| `VITE_API_URL` | Frontend | API base URL (e.g. `http://localhost:5000/api`) |

## CI

GitHub Actions (`.github/workflows/ci.yml`) on push/PR to `main` (Node.js 22):

* **backend-ci:** `npm install` → `npm test` (8 Jest suites)
* **frontend-ci:** `npm install` → `npm test` (Vitest) → `npm run lint` → `npm run build`

**Status:** Passing on `main` as of July 31, 2026.

## Related Docs

* Architecture detail: `technical.md`
* Pending work: `backlog.md`
* Audit findings: `audit-report.md`
