# Engineering Documentation

**Last updated:** July 31, 2026

## Engineering Decisions

* **Monorepo structure:** `frontend/` and `backend/` separated for clear concerns while sharing one repository.
* **REST API:** Express 5 exposes JSON REST endpoints consumed by the React SPA.
* **JWT authentication:** Access tokens (localStorage) + httpOnly refresh cookies; bcrypt (12 rounds) for passwords.
* **Role-based access control (RBAC):** Route-level enforcement via `authorize()` middleware using role names. The `Role.permissions` array is stored but not yet enforced programmatically.
* **Mongoose ODM:** Schema validation, references, indexes, and middleware for MongoDB.
* **Layered backend:** `routes → controllers → services → models` with `express-validator` at the route layer.
* **Client form validation:** React Hook Form + Zod schemas in `frontend/src/schemas/` mirror backend validators.
* **Background jobs:** `node-cron` runs daily license-expiry suspension (midnight IST), skipping drivers on active dispatched trips.
* **Demo fallback:** Frontend `api.js` can serve mock data when the backend is unreachable (see `docs/backlog.md` for known mock-mode issues).

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
| Jest + Supertest | API tests (RBAC suite in CI) |

## Key Directories

```
backend/
  controllers/   # HTTP handlers
  services/      # Business logic
  models/        # Mongoose schemas
  routes/        # Route definitions + RBAC
  validators/    # express-validator rules
  utils/         # cronJobs, errorHandler, sendEmail
  seeders/       # Demo data seeder
  tests/         # Jest tests

frontend/src/
  pages/app/     # Authenticated app pages
  pages/auth/    # Login, register, password reset
  components/ui/ # Design system primitives
  components/common/  # Shared Modal, Toast, SelectField
  schemas/       # Zod validation schemas
  contexts/      # AuthContext
  services/      # api.js, mockData.js
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

GitHub Actions (`.github/workflows/ci.yml`):

* Backend: `npm test` (RBAC integration tests)
* Frontend: `npm run lint` + `npm run build`

## Related Docs

* Architecture detail: `technical.md`
* Pending work: `backlog.md`
* Audit findings: `audit-report.md`
