# TransitOps – Technical Implementation Reference

> **Status:** ✅ Phases 1–8 Complete · P6 shipped · **Production live** (Vercel + Render + Atlas)  
> **Stack:** MERN (MongoDB · Express 5 · React 19 · Node.js)  
> **Last Updated:** 2026-07-31 (post cloud deployment)

**Phases:** 1 Auth · 2 Vehicles · 3 Drivers · 4 Trips · 5 Maintenance · 6 Fuel/Expenses · 7 Dashboard · 8 Reports/CSV

Pending work (P6 future features): see `backlog.md`.

---

## 1. Project Structure

```
TransitOps/
├── backend/
│   ├── config/
│   │   └── db.js                         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js             # Login, refresh, logout, getMe
│   │   ├── userController.js             # User CRUD
│   │   ├── vehicleController.js          # Vehicle CRUD
│   │   ├── driverController.js           # Driver CRUD
│   │   ├── tripController.js             # Trip create/dispatch/complete/cancel
│   │   ├── maintenanceController.js      # Maintenance log CRUD
│   │   ├── fuelController.js             # Fuel log CRUD
│   │   ├── expenseController.js          # Expense CRUD
│   │   ├── dashboardController.js        # Dashboard KPI aggregations
│   │   ├── reportController.js             # ROI report + CSV export
│   │   └── auditController.js              # Audit log read (admin)
│   ├── middlewares/
│   │   ├── authenticate.js               # JWT Bearer verification
│   │   ├── authorize.js                  # RBAC role-gate factory
│   │   ├── auditMiddleware.js            # Mutation audit logging
│   │   ├── rateLimiter.js                # Auth rate limiting
│   │   └── requirePasswordUpdated.js     # Block routes until password changed
│   ├── models/
│   │   ├── Role.js                       # Role schema
│   │   ├── User.js                       # User schema (bcrypt pre-save)
│   │   ├── RefreshToken.js               # Refresh token with TTL index
│   │   ├── Vehicle.js                    # Vehicle schema
│   │   ├── Driver.js                     # Driver schema
│   │   ├── Trip.js                       # Trip schema (compound indexes)
│   │   ├── MaintenanceLog.js             # Maintenance log schema
│   │   ├── FuelLog.js                    # Fuel log schema
│   │   ├── Expense.js                    # Expense schema
│   │   └── AuditLog.js                   # Audit log schema
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth
│   │   ├── userRoutes.js                 # /api/users (admin only)
│   │   ├── roleRoutes.js                 # /api/roles (admin only)
│   │   ├── vehicleRoutes.js              # /api/vehicles
│   │   ├── driverRoutes.js               # /api/drivers
│   │   ├── tripRoutes.js                 # /api/trips
│   │   ├── maintenanceRoutes.js          # /api/maintenance
│   │   ├── fuelRoutes.js                 # /api/fuel
│   │   ├── expenseRoutes.js              # /api/expenses
│   │   ├── dashboardRoutes.js            # /api/dashboard
│   │   ├── reportRoutes.js               # /api/reports
│   │   └── auditRoutes.js                # /api/audit-logs (admin read)
│   ├── seeders/
│   │   └── seed.js                       # Seeds roles + demo fleet data
│   ├── services/
│   │   ├── authService.js                # Auth business logic
│   │   ├── userService.js                # User CRUD business logic
│   │   ├── vehicleService.js             # Vehicle CRUD + delete protection
│   │   ├── driverService.js              # Driver CRUD + delete protection
│   │   ├── tripService.js                # Trip lifecycle + business rules
│   │   ├── maintenanceService.js         # Maintenance + vehicle status sync
│   │   ├── fuelService.js                # Fuel log CRUD logic
│   │   ├── expenseService.js             # Expense CRUD logic
│   │   ├── reportService.js              # ROI aggregation + CSV generation
│   │   └── auditService.js               # Audit log queries
│   ├── utils/
│   │   ├── errorHandler.js               # AppError class + global handler
│   │   ├── cronJobs.js                   # Daily license expiry suspension
│   │   ├── sendEmail.js                  # Nodemailer helper
│   │   ├── escapeRegex.js                # Safe regex escaping for search
│   │   ├── pagination.js                 # parsePagination() for list endpoints
│   │   ├── passwordPolicy.js             # Server-side password rules
│   │   └── validateEnv.js                # Startup env validation
│   ├── tests/                            # Jest + Supertest (8 suites / 53 tests)
│   ├── validators/
│   │   ├── authValidator.js              # express-validator rule sets
│   │   ├── vehicleValidator.js           # Vehicle field rules
│   │   ├── driverValidator.js            # Driver field rules
│   │   ├── tripValidator.js              # Trip field rules
│   │   ├── maintenanceValidator.js       # Maintenance log field rules
│   │   └── financeValidator.js           # Fuel & Expense field rules
│   ├── .env.example                      # Environment template
│   ├── app.js                            # Express app (routes, middleware, health)
│   ├── server.js                         # DB connect, cron, graceful shutdown
│   ├── Dockerfile                        # Production API image
│   └── package.json
│
├── docker-compose.yml                    # MongoDB replica set + API + frontend
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                       # Button, Card, Modal, Table, Toast, Skeleton, etc.
    │   │   ├── common/                   # Modal, Toast, SelectField, SearchableSelectField, SearchInput
    │   │   ├── ProtectedRoute.jsx        # Auth + role guard component
    │   │   └── ProtectedRoute.test.jsx   # Vitest smoke tests
    │   ├── hooks/                        # useDebounce (search)
    │   ├── lib/                          # selectOptions, passwordPolicy, apiErrors, utils
    │   ├── test/                         # Vitest setup
    │   ├── schemas/                      # Zod form schemas (mirror backend validators)
    │   ├── contexts/
    │   │   └── AuthContext.jsx           # Auth state + login/logout + useAuth()
    │   ├── layouts/
    │   │   └── AppLayout.jsx             # Sidebar, breadcrumbs, theme toggle
    │   ├── pages/
    │   │   ├── LandingPage.jsx           # Marketing landing page
    │   │   ├── auth/                     # Login, Register, Forgot/Reset Password
    │   │   └── app/                      # Dashboard, Vehicles, Drivers, Trips, etc.
    │   ├── services/
    │   │   ├── api.js                    # Axios instance + interceptors + mock fallback
    │   │   └── mockData.js               # Offline demo data
    │   ├── App.jsx                       # React Router + route definitions
    │   ├── index.css                     # Tailwind v4 + design tokens
    │   └── main.jsx                      # React entry point
    ├── vite.config.js
    └── package.json
```

---

## 2. Tech Stack & Dependencies

### Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server framework |
| `mongoose` | ^9.7.4 | MongoDB ODM |
| `bcryptjs` | ^3.0.3 | Password hashing (salt rounds: 12) |
| `jsonwebtoken` | ^9.0.3 | JWT access token signing/verification |
| `cookie-parser` | ^1.4.7 | Parse `refreshToken` from httpOnly cookie |
| `express-validator` | ^7.3.2 | Input validation middleware |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `dotenv` | ^17.4.2 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev auto-restart |
| `node-cron` | ^4.6.0 | Scheduled jobs (license expiry) |
| `nodemailer` | ^9.0.3 | Password-reset emails |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.7 | UI library |
| `react-dom` | ^19.2.7 | DOM renderer |
| `react-router-dom` | ^7.18.1 | Client-side routing |
| `axios` | ^1.18.1 | HTTP client |
| `recharts` | ^3.9.2 | Dashboard charts |
| `react-hook-form` | ^7.83.0 | Form state |
| `zod` | ^4.4.3 | Client validation |
| `@hookform/resolvers` | ^5.5.7 | Zod ↔ RHF bridge |
| `lucide-react` | ^1.24.0 | Icons |
| `tailwindcss` | ^4.3.2 | Utility-first CSS (v4) |
| `@tailwindcss/vite` | ^4.3.2 | Vite integration plugin |
| `vite` | ^8.1.1 | Build tool & dev server |

---

## 3. Environment Variables

### Backend (`backend/.env`)

**Local development:**

```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/transitops?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=...                       # Access token signing secret (≥ 16 chars)
CLIENT_URL=http://localhost:5173     # CORS allowed origin
FRONTEND_URL=http://localhost:5173   # Password-reset email link base URL
NODE_ENV=development
PASSWORD_POLICY_ENFORCEMENT=true
SMTP_HOST=...
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
FROM_NAME=TransitOps
```

**Render (production):** Set `CLIENT_URL=https://transitops-han.vercel.app`, `NODE_ENV=production`, same `MONGO_URI` / `JWT_SECRET`. `JWT_REFRESH_SECRET` is **not used** (refresh tokens are random bytes in MongoDB).

### Frontend

| File | `VITE_API_URL` |
|------|----------------|
| `.env.development` | `http://localhost:5000/api` |
| `.env.production` | `https://transitops-yqkc.onrender.com/api` |

Full deployment guide: **`docs/deployment.md`**

---

## 4. Database Collections

### 4.1 `roles` Collection

**Model:** `backend/models/Role.js`

| Field | Type | Notes |
|---|---|---|
| `name` | String (enum) | `admin` · `fleet_manager` · `driver` · `safety_officer` · `financial_analyst` |
| `displayName` | String | Human-readable label |
| `description` | String | Role description |
| `permissions` | [String] | Permission keys (e.g. `vehicles:read`) |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

**Seeded Roles & Permissions:**

| Role | displayName | Permissions |
|---|---|---|
| `admin` | Administrator | `["*"]` — full access |
| `fleet_manager` | Fleet Manager | vehicles, maintenance, dashboard |
| `driver` | Driver | trips, vehicles:read, drivers:read, dashboard |
| `safety_officer` | Safety Officer | drivers, dashboard |
| `financial_analyst` | Financial Analyst | fuel, expenses, reports, dashboard |

### 4.2 `users` Collection

**Model:** `backend/models/User.js`

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, regex validated |
| `password` | String | `select: false` — excluded from all queries by default |
| `role` | ObjectId → Role | Required reference |
| `isActive` | Boolean | Default `true`; inactive users are blocked from login |
| `lastLogin` | Date | Updated on every successful login |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### 4.3 `refreshtokens` Collection

**Model:** `backend/models/RefreshToken.js`

| Field | Type | Notes |
|---|---|---|
| `token` | String | Unique 64-byte hex random string |
| `user` | ObjectId → User | Owner reference |
| `expiresAt` | Date | 7 days from creation |
| `isRevoked` | Boolean | Set `true` on logout |
| `createdAt` | Date | Auto |

**Key behaviour:** MongoDB TTL index on `expiresAt` (`expireAfterSeconds: 0`) — documents auto-deleted by MongoDB when expired.

### 4.4 `vehicles` Collection

**Model:** `backend/models/Vehicle.js`

| Field | Type | Notes |
|---|---|---|
| `registrationNumber` | String | Required, unique, uppercase |
| `vehicleName` | String | Required |
| `model` | String | Required |
| `type` | String | Required |
| `capacity` | Number | Required, minimum 0.1 (kg) |
| `odometer` | Number | Required, minimum 0 |
| `acquisitionCost` | Number | Optional, >= 0 |
| `status` | String (enum) | `Available` · `On Trip` · `In Shop` · `Retired`. Default `Available` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### 4.5 `drivers` Collection

**Model:** `backend/models/Driver.js`

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, trimmed |
| `licenseNumber` | String | Required, unique, uppercase |
| `licenseCategory` | String | Required, trimmed |
| `expiryDate` | Date | Required — license expiry |
| `contact` | String | Required, trimmed |
| `safetyScore` | Number | 0–100, default `100` |
| `status` | String (enum) | `Available` · `On Trip` · `Off Duty` · `Suspended`. Default `Available` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### 4.6 `trips` Collection

**Model:** `backend/models/Trip.js`

| Field | Type | Notes |
|---|---|---|
| `source` | String | Required, trimmed |
| `destination` | String | Required, trimmed |
| `vehicle` | ObjectId → Vehicle | Required reference |
| `driver` | ObjectId → Driver | Required reference |
| `cargoWeight` | Number | Required, >= 0 (kg) |
| `plannedDistance` | Number | Required, >= 0 (km) |
| `revenue` | Number | Optional, >= 0 |
| `actualDistance` | Number | Optional (set on complete), >= 0 |
| `fuelUsed` | Number | Optional (set on complete), >= 0 |
| `status` | String (enum) | `Draft` · `Dispatched` · `Completed` · `Cancelled`. Default `Draft` |
| `dispatchedAt` | Date | Set when dispatched |
| `completedAt` | Date | Set when completed |
| `cancelledAt` | Date | Set when cancelled |
| `notes` | String | Optional, trimmed |
| `createdBy` | ObjectId → User | Required reference |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

**Indexes:**
- `{ vehicle: 1, status: 1 }` — fast active-trip lookup per vehicle
- `{ driver: 1, status: 1 }` — fast active-trip lookup per driver
- `{ status: 1, createdAt: -1 }` — fast list queries by status

### 4.7 `maintenancelogs` Collection

**Model:** `backend/models/MaintenanceLog.js`

| Field | Type | Notes |
|---|---|---|
| `vehicle` | ObjectId → Vehicle | Required reference, indexed |
| `serviceType` | String | Required, trimmed (e.g. `Oil Change`, `Engine Repair`) |
| `cost` | Number | Required, >= 0 |
| `date` | Date | Required, default `Date.now` |
| `status` | String (enum) | `Active` · `Completed`. Default `Active`, indexed |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### 4.8 `fuel_logs` Collection

**Model:** `backend/models/FuelLog.js`

| Field | Type | Notes |
|---|---|---|
| `vehicle` | ObjectId → Vehicle | Required reference, indexed |
| `trip` | ObjectId → Trip | Optional reference, indexed |
| `liters` | Number | Required, min > 0 |
| `cost` | Number | Required, min > 0 |
| `odometer` | Number | Required, min >= 0 |
| `date` | Date | Required, default `Date.now` |
| `createdBy` | ObjectId → User | Required reference |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

**Indexes:**
- `{ vehicle: 1, date: -1 }` — fast lookup per vehicle, chronological
- `{ trip: 1 }` — fast lookup per trip

### 4.9 `expenses` Collection

**Model:** `backend/models/Expense.js`

| Field | Type | Notes |
|---|---|---|
| `vehicle` | ObjectId → Vehicle | Required reference, indexed |
| `trip` | ObjectId → Trip | Optional reference |
| `amount` | Number | Required, min > 0 |
| `category` | String (enum) | `Toll` · `Repair` · `Parking` · `Insurance` · `Miscellaneous` |
| `notes` | String | Optional, trimmed |
| `date` | Date | Required, default `Date.now` |
| `createdBy` | ObjectId → User | Required reference |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

**Indexes:**
- `{ vehicle: 1, date: -1 }` — fast lookup per vehicle, chronological
- `{ category: 1, date: -1 }` — fast lookup by category

---

## 5. API Endpoints

### 5.1 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password, roleName }` | `{ user }` (created with `isActive: false`) |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `{ user, accessToken, requiresPasswordChange? }` + sets `refreshToken` cookie |
| `POST` | `/api/auth/refresh` | Cookie | — | `{ accessToken, user }` |
| `POST` | `/api/auth/logout` | Cookie | — | Clears cookie, revokes token |
| `GET` | `/api/auth/me` | Bearer JWT | — | `{ user }` with role populated (allowed while `mustChangePassword`) |
| `POST` | `/api/auth/change-password` | Bearer JWT | `{ currentPassword, newPassword }` | `{ user }` — revokes other refresh tokens, keeps current session |
| `POST` | `/api/auth/forgot-password` | Public | `{ email }` | `{ message }`; in dev without SMTP also `{ data: { previewUrl } }` |
| `POST` | `/api/auth/reset-password/:token` | Public | `{ password }` | `{ message }` |

### 5.2 User Routes — `/api/users` (Admin Only)

All routes require: `Authorization: Bearer <accessToken>` with `admin` role.

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/users?page=1&limit=20` | — | Paginated `{ users, total, page, pages }` |
| `GET` | `/api/users/:id` | — | Single `{ user }` |
| `POST` | `/api/users` | `{ name, email, password, roleId }` | Created `{ user }` |
| `PUT` | `/api/users/:id` | Any of `{ name, email, password, roleId, isActive }` | Updated `{ user }` |
| `DELETE` | `/api/users/:id` | — | `{ message }` (cannot delete self) |

### 5.3 Role Routes — `/api/roles` (Admin Only)

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/api/roles` | Bearer JWT + admin | All roles array |

### 5.4 Vehicle Routes — `/api/vehicles`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/vehicles?page=1&limit=20&search=&status=` | admin, fleet_manager, driver | Paginated `{ vehicles, total, page, pages }` |
| `GET` | `/api/vehicles/:id` | admin, fleet_manager, driver | Single `{ vehicle }` |
| `POST` | `/api/vehicles` | admin, fleet_manager | Created `{ vehicle }` |
| `PUT` | `/api/vehicles/:id` | admin, fleet_manager | Updated `{ vehicle }` |
| `DELETE` | `/api/vehicles/:id` | admin, fleet_manager | `{ message }` |

### 5.5 Driver Routes — `/api/drivers`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/drivers?page=1&limit=20&search=&status=` | admin, driver, safety_officer | Paginated `{ drivers, total, page, pages }` |
| `GET` | `/api/drivers/:id` | admin, driver, safety_officer | Single `{ driver }` |
| `POST` | `/api/drivers` | admin, safety_officer | Created `{ driver }` |
| `PUT` | `/api/drivers/:id` | admin, safety_officer | Updated `{ driver }` |
| `DELETE` | `/api/drivers/:id` | admin, safety_officer | `{ message }` |

### 5.6 Trip Routes — `/api/trips`

| Method | Endpoint | Auth Roles | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/trips?page=1&limit=20&search=&status=` | admin, fleet_manager, driver, safety_officer | — | Paginated `{ trips, total, page, pages }` |
| `GET` | `/api/trips/:id` | admin, fleet_manager, driver, safety_officer | — | Single `{ trip }` populated |
| `POST` | `/api/trips` | admin, driver | `{ source, destination, vehicle, driver, cargoWeight, plannedDistance, revenue?, notes? }` | Created `{ trip }` (status: `Draft`) |
| `PUT` | `/api/trips/:id/dispatch` | admin, driver | — | Updated `{ trip }` (status: `Dispatched`) |
| `PUT` | `/api/trips/:id/complete` | admin, driver, fleet_manager | `{ actualDistance, fuelUsed }` | Updated `{ trip }` (status: `Completed`) |
| `PUT` | `/api/trips/:id/cancel` | admin, driver | — | Updated `{ trip }` (status: `Cancelled`) |

### 5.7 Maintenance Routes — `/api/maintenance`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/maintenance?page=1&limit=20&search=&status=` | admin, fleet_manager | Paginated `{ logs, total, page, pages }` populated with vehicle |
| `GET` | `/api/maintenance/:id` | admin, fleet_manager | Single `{ log }` populated |
| `POST` | `/api/maintenance` | admin, fleet_manager | Created `{ log }` — vehicle status → `In Shop` |
| `PUT` | `/api/maintenance/:id` | admin, fleet_manager | Updated `{ log }` — handles vehicle status transitions |
| `DELETE` | `/api/maintenance/:id` | admin, fleet_manager | `{ message }` — restores vehicle if no other active logs |

### 5.8 Fuel Routes — `/api/fuel`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/fuel?page=1&limit=20&vehicleId=&tripId=` | admin, fleet_manager, driver | Paginated `{ logs, total, page, pages }` populated |
| `GET` | `/api/fuel/:id` | admin, fleet_manager, driver | Single `{ log }` populated |
| `POST` | `/api/fuel` | admin, fleet_manager | Created `{ log }` |
| `PUT` | `/api/fuel/:id` | admin, fleet_manager | Updated `{ log }` |
| `DELETE` | `/api/fuel/:id` | admin, fleet_manager | `{ message }` |

### 5.9 Expense Routes — `/api/expenses`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/expenses?page=1&limit=20&vehicleId=&tripId=&category=` | admin, fleet_manager, driver | Paginated `{ expenses, total, page, pages }` populated |
| `GET` | `/api/expenses/:id` | admin, fleet_manager, driver | Single `{ expense }` populated |
| `POST` | `/api/expenses` | admin, fleet_manager | Created `{ expense }` |
| `PUT` | `/api/expenses/:id` | admin, fleet_manager | Updated `{ expense }` |
| `DELETE` | `/api/expenses/:id` | admin, fleet_manager | `{ message }` |

### 5.10 Dashboard Routes — `/api/dashboard`

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | admin, fleet_manager, driver, safety_officer, financial_analyst | KPI counts, fleet utilization, 6-month trend data for charts |

### 5.11 Report Routes — `/api/reports`

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/api/reports/roi` | admin, financial_analyst, fleet_manager | Per-vehicle ROI (revenue, fuel, expenses, maintenance, net ROI) + fleet metrics |
| `GET` | `/api/reports/roi/download` | admin, financial_analyst, fleet_manager | CSV file download |

CSV is generated in `reportService.generateCSV()` (hand-rolled, not `json2csv`).

### 5.12 Health — `/api/health`

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/api/health` | Public | `{ status: "ok", timestamp }` — used by Docker Compose healthcheck |

### 5.13 Audit Log Routes — `/api/audit-logs` (Admin Only)

| Method | Endpoint | Query params | Response |
|---|---|---|---|
| `GET` | `/api/audit-logs` | `page`, `limit`, `action`, `resource`, `userId`, `from`, `to` | Paginated `{ logs, total, page, pages }` with populated user |

Mutations are logged automatically by `auditMiddleware` on successful POST/PUT/PATCH/DELETE responses.

### 5.14 Standard Response Envelope

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error" }
```

HTTP status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`

---

## 6. Security Architecture

### 6.1 Token Strategy

```
Login
  → Server issues:
      accessToken  (JWT, 1 day, includes `pwdAt` claim, stored in localStorage)
      refreshToken (64-byte hex, 7 days, stored in httpOnly cookie)

Access Protected Route
  → Client sends: Authorization: Bearer <accessToken>
  → Server: jwt.verify() → checks pwdAt vs user.passwordUpdatedAt → populates req.user

Token Expiry / 401
  → Axios interceptor intercepts 401 (except /login, /refresh)
  → Queues pending requests
  → Calls POST /api/auth/refresh (sends cookie automatically)
  → Rotates refresh token (old revoked, new cookie set), issues new accessToken
  → Replays all queued requests
  → If refresh fails → clear localStorage → redirect to /login

Logout
  → POST /api/auth/logout → marks RefreshToken.isRevoked = true
  → Server clears cookie (res.clearCookie)
  → Client clears localStorage
```

### 6.2 Middleware Chain

```
Route → authenticate → authorize("role1", "role2") → controller
```

**authenticate.js:**
1. Extracts `Authorization: Bearer <token>`
2. `jwt.verify(token, JWT_SECRET)`
3. `User.findById(decoded.id).populate('role')` — checks user still exists and `isActive === true`
4. Compares JWT `pwdAt` claim to `user.passwordUpdatedAt` — rejects stale tokens after password reset
5. Attaches `req.user` for downstream use

**authorize.js:**
- Factory: `authorize(...roles)` returns middleware
- Checks `req.user.role.name` against allowed roles array
- Returns `403` if not in allowed list
- **Dashboard** (`GET /api/dashboard/stats`): all app roles
- **Reports** (`GET /api/reports/roi`, `/roi/download`): `admin`, `financial_analyst`, `fleet_manager`
- **Self-registration**: `admin` role rejected at service layer (403)

**Security middleware:**
- `helmet()` — standard HTTP security headers on all responses
- `authLimiter` — 30 requests per 15 minutes per IP on `/api/auth/*`
- Forgot-password always returns 200 with generic message (prevents email enumeration)

**Search safety:**
- User search input is escaped via `utils/escapeRegex.js` before MongoDB `$regex` queries (vehicles, drivers, trips, maintenance)

### 6.3 Password Security

- Algorithm: `bcrypt` with salt rounds `12`
- Never stored in plaintext
- `select: false` on schema — never returned in queries unless explicitly `+password`
- Minimum 6 characters enforced at validator level across register, reset, login, and admin user create/update

**Compliance password policy** (when `PASSWORD_POLICY_ENFORCEMENT=true`, default):

| Rule | Requirement |
|---|---|
| Length | Minimum 6 characters |
| Uppercase | At least one `A–Z` |
| Lowercase | At least one `a–z` |
| Number | At least one `0–9` |
| Special | At least one non-alphanumeric character |
| Spaces | Not allowed |

- On login, existing passwords are checked against this policy. Non-compliant users receive `requiresPasswordChange: true` and are blocked from all protected routes except `/api/auth/me`, `/api/auth/change-password`, and `/api/auth/logout` until they update.
- Admin create/update, register, reset, and change-password flows enforce the full policy on **new** passwords.
- Set `PASSWORD_POLICY_ENFORCEMENT=false` in `.env` once all users have migrated (feature can be retired).
- User schema fields: `mustChangePassword` (boolean), `passwordPolicyVersion` (number, current `1`).

### 6.4 CORS

- Production: origin must match `CLIENT_URL` or `FRONTEND_URL` (comma-separated list supported)
- Development: any `http://localhost:<port>` or `http://127.0.0.1:<port>` origin is allowed (Vite may use 5174+ if 5173 is in use)
- `credentials: true` — required to send/receive cookies for refresh token
- Production refresh cookies: `SameSite=None; Secure` (cross-origin Vercel ↔ Render)

---

## 7. Input Validation

Uses `express-validator` across all modules.

| Validator | Used On | Key Fields |
|---|---|---|
| `registerValidator` | `POST /api/auth/register` | name, email, password (min 6 + policy), roleName |
| `loginValidator` | `POST /api/auth/login` | email (format + normalise), password (min 6) |
| `changePasswordValidator` | `POST /api/auth/change-password` | currentPassword, newPassword (min 6 + policy) |
| `createUserValidator` | `POST /api/users` | name, email, password (min 6 + policy), roleId, optional isActive |
| `updateUserValidator` | `PUT /api/users/:id` | All optional — same rules + isActive (boolean) |
| `createVehicleValidator` | `POST /api/vehicles` | registrationNumber, vehicleName, model, type, capacity (>0.1), odometer (>=0) |
| `updateVehicleValidator` | `PUT /api/vehicles/:id` | All optional — same rules |
| `createDriverValidator` | `POST /api/drivers` | name, licenseNumber, licenseCategory, expiryDate (ISO8601), contact, safetyScore (0–100) |
| `updateDriverValidator` | `PUT /api/drivers/:id` | All optional — same rules |
| `createTripValidator` | `POST /api/trips` | source, destination, vehicle (MongoId), driver (MongoId), cargoWeight (>=0), plannedDistance (>=0) |
| `completeTripValidator` | `PUT /api/trips/:id/complete` | actualDistance (>=0), fuelUsed (>=0), revenue (>=0, optional) |
| `createMaintenanceValidator` | `POST /api/maintenance` | vehicle (MongoId), serviceType, cost (>=0), date (ISO8601) |
| `updateMaintenanceValidator` | `PUT /api/maintenance/:id` | All optional — same rules |
| `createFuelValidator` | `POST /api/fuel` | vehicle (MongoId), trip (MongoId, opt), liters (>0), cost (>0), odometer (>=0) |
| `updateFuelValidator` | `PUT /api/fuel/:id` | All optional — same rules |
| `createExpenseValidator` | `POST /api/expenses` | vehicle (MongoId), category (enum), amount (>0), notes, date |
| `updateExpenseValidator` | `PUT /api/expenses/:id` | All optional — same rules |

---

## 8. Error Handling

**File:** `backend/utils/errorHandler.js`

### AppError Class

```js
throw new AppError("Message", statusCode)
```
All operational errors thrown using `AppError`. Non-operational errors bubble to global handler.

### Global Error Handler (Express middleware)

| Error Type | Detection | Response |
|---|---|---|
| Duplicate key | `err.code === 11000` | 409 — `"<field> already exists"` |
| Mongoose validation | `err.name === 'ValidationError'` | 400 — joined messages |
| Invalid JWT | `err.name === 'JsonWebTokenError'` | 401 |
| Expired JWT | `err.name === 'TokenExpiredError'` | 401 |
| All others | — | Original `statusCode` or 500 |

Stack traces included only in `NODE_ENV=development`.

---

## 9. Service Layer

### 9.1 authService.js

| Function | Description |
|---|---|
| `login(email, password)` | Finds user (with `+password`), verifies bcrypt, updates `lastLogin`, issues both tokens |
| `generateAccessToken(user)` | `jwt.sign({ id, pwdAt }, JWT_SECRET, { expiresIn: '1d' })` |
| `generateRefreshToken(userId)` | 64-byte hex via `crypto.randomBytes`, persists to `RefreshToken` collection |
| `refreshAccessToken(token)` | Validates stored token, revokes it, issues new access + refresh tokens (rotation) |
| `logout(token)` | Sets `isRevoked: true` on the stored refresh token |
| `getUserById(id)` | Returns user with role populated, no password |

### 9.2 userService.js

| Function | Description |
|---|---|
| `getAllUsers(page, limit)` | Paginated list sorted by `createdAt` desc, role populated |
| `createUser({ name, email, password, roleId })` | Validates role exists, checks duplicate email, creates user |
| `updateUser(id, updates)` | Patches only provided fields; password re-hashed via pre-save hook |
| `deleteUser(id, requestingUserId)` | Prevents self-deletion; hard deletes |
| `getUserById(id)` | Returns single user with full role data |

### 9.3 vehicleService.js

| Function | Description |
|---|---|
| `getAllVehicles(page, limit, search, status)` | Paginated, regex search on reg/name/model, status filter |
| `getVehicleById(id)` | Returns single vehicle; 404 if not found |
| `createVehicle(data)` | Checks registration uniqueness (409 on collision), creates |
| `updateVehicle(id, data)` | Checks registration uniqueness excluding current; updates |
| `deleteVehicle(id)` | Hard deletes vehicle |

### 9.4 driverService.js

| Function | Description |
|---|---|
| `getAllDrivers(page, limit, search, status)` | Paginated, regex search on name/licenseNumber/licenseCategory, status filter |
| `getDriverById(id)` | Returns single driver; 404 if not found |
| `createDriver(data)` | Checks license number uniqueness (409 on collision), creates |
| `updateDriver(id, data)` | Checks license number uniqueness excluding current; blocks manual `On Trip` status |
| `deleteDriver(id)` | Hard deletes driver |

### 9.5 tripService.js

| Function | Description |
|---|---|
| `getAllTrips({ page, limit, status, search })` | Paginated, regex search on source/destination, status filter; fully populated |
| `getTripById(id)` | Returns single fully-populated trip; 404 if not found |
| `createTrip(data, userId)` | Validates vehicle/driver exist, creates a `Draft` trip with `createdBy` set |
| `dispatchTrip(tripId)` | Runs `applyDispatchRules()` inside MongoDB transaction; enforces 9 PRD business rules; sets vehicle/driver → `On Trip` |
| `completeTrip(tripId, { actualDistance, fuelUsed, revenue })` | Transitions `Dispatched` → `Completed`, rolls vehicle odometer forward, optional revenue, restores vehicle/driver → `Available` |
| `cancelTrip(tripId)` | Transitions `Draft` → `Cancelled` only |

**Dispatch business rules enforced sequentially:**
1. Vehicle must not be `Retired`
2. Vehicle must not be `In Shop`
3. Vehicle must be `Available`
4. Vehicle must not be in another active (`Dispatched`) trip
5. Driver must not be `Suspended`
6. Driver must be `Available`
7. Driver license must not be expired
8. Driver must not be in another active trip
9. Cargo weight must not exceed vehicle capacity

### 9.6 maintenanceService.js

| Function | Description |
|---|---|
| `getAllLogs({ page, limit, search, status })` | Paginated, regex search on serviceType and vehicle reg/name; populated |
| `getLogById(id)` | Returns single populated log; 404 if not found |
| `createLog(data)` | Validates vehicle is not `Retired` or `On Trip`, creates log, sets vehicle → `In Shop` |
| `updateLog(id, data)` | Handles status transitions; sets/clears `closeDate` on Complete/Re-open; syncs vehicle status |
| `deleteLog(id)` | Deletes log; if `Active`, restores vehicle to `Available` if no other active logs exist |

### 9.7 fuelService.js & 9.8 expenseService.js

| Function | Description |
|---|---|
| `getAll*({ page, limit, vehicleId, tripId, category })` | Paginated, filterable queries; fully populated vehicle/trip |
| `get*ById(id)` | Returns single populated log; 404 if not found |
| `create*(data, userId)` | Validates vehicle exists, validates trip matches vehicle if provided; creates record |
| `update*(id, data)` | Validates vehicle/trip relations on patch; updates record |
| `delete*(id)` | Hard deletes record |

---

## 10. Seeder

**File:** `backend/seeders/seed.js`
**Command:** `npm run seed`

**Idempotent** — safe to re-run. Uses `findOneAndUpdate` with `upsert: true`.

**Seeds:**
1. All 5 roles with permissions
2. Five demo users (see table below)
3. 20 vehicles, 25 drivers, 60 trips, fuel logs, expenses, maintenance logs

**Demo credentials** (password for all: `Password@123`):

| Email | Role |
|---|---|
| `admin@transitops.com` | admin |
| `manager@transitops.com` | fleet_manager |
| `driver@transitops.com` | driver |
| `safety@transitops.com` | safety_officer |
| `finance@transitops.com` | financial_analyst |

---

## 11. Frontend Architecture

### 11.1 Routing Structure

**File:** `frontend/src/App.jsx`

```
/                     → LandingPage (public marketing site)
/login                → LoginPage (public)
/register             → RegisterPage (public)
/forgot-password      → ForgotPasswordPage (public)
/reset-password/:token → ResetPasswordPage (public)
/unauthorized         → UnauthorizedPage (public)
/*                    → NotFoundPage (public)
/dev/components       → DevComponentsPage (development only — remove before production)

Protected (ProtectedRoute wrapping AppLayout):
  /dashboard          → DashboardPage (live KPIs + Recharts)
  /vehicles           → VehiclesPage (admin, fleet_manager, driver)
  /drivers            → DriversPage (admin, driver, safety_officer)
  /trips              → TripsPage (admin, fleet_manager, driver, safety_officer)
  /maintenance        → MaintenancePage (admin, fleet_manager)
  /fuel               → FinancePage (admin, fleet_manager, driver)
  /expenses           → FinancePage (admin, fleet_manager, driver)
  /reports            → ReportsPage (ROI table + CSV export)
  /users              → UsersPage (admin only)

*                     → redirect to /dashboard
```

### 11.2 AuthContext

**File:** `frontend/src/contexts/AuthContext.jsx`

**State:**
```js
{
  user: object | null,      // populated user object with role
  loading: boolean,         // true during initial session restore
  error: string | null,     // last login error message
  isAuthenticated: boolean  // derived from !!user
}
```

**Methods exposed via `useAuth()` hook:**
- `login(email, password)` → calls `POST /api/auth/login`, stores `accessToken` in `localStorage`
- `register(name, email, password, roleName)` → calls `POST /api/auth/register`; surfaces backend validation errors via `getApiErrorMessage`
- `logout()` → calls `POST /api/auth/logout`, clears `localStorage`, resets user state
- `clearError()` → clears error message

**Session restoration:** On mount, checks `localStorage` for token → calls `GET /api/auth/me` → sets user or clears storage.

**Session sync:** On token refresh, `AuthContext` updates `user` from the refresh response. On window focus, `/auth/me` is called to pick up admin role/status changes.

### 11.3 API Service

**File:** `frontend/src/services/api.js`

- **Base URL:** `VITE_API_URL` or `http://localhost:5000/api`
- **`withCredentials: true`** — sends refresh token cookie on every request
- **Request interceptor:** Reads `accessToken` from `localStorage`, sets `Authorization: Bearer <token>`
- **Response interceptor (token refresh queue):**
  - On `401` (excluding `/login` and `/refresh`): sets `isRefreshing = true`
  - Queues all concurrent failed requests in `failedQueue`
  - Calls `POST /api/auth/refresh` once
  - On success: replays all queued requests with new token
  - On failure: clears `localStorage`, redirects to `/login`
- **Demo/mock fallback:** GET data endpoints only; all `/auth/*` requests always fail through to the UI (no fake success)

**File:** `frontend/src/lib/apiErrors.js`

- `getApiErrorMessage(err, fallback)` — extracts `errors[].msg` from validation responses before falling back to `message`

### 11.4 ProtectedRoute

**File:** `frontend/src/components/ProtectedRoute.jsx`

**Behaviour:**
1. While `loading === true` → shows full-screen spinner
2. If not authenticated → `<Navigate to="/login" state={{ from: location }} />`
3. If `allowedRoles` provided and user role not in list → `<Navigate to="/unauthorized" />`
4. Otherwise → renders `children`

### 11.5 AppLayout — Sidebar & Header

**File:** `frontend/src/layouts/AppLayout.jsx`

- Collapsible sidebar (260px expanded / 72px collapsed) — visible `md+` (`hidden md:flex`)
- Mobile drawer below `768px`; hamburger uses `.app-header-menu-btn` (CSS-hidden on desktop)
- Breadcrumbs: Home → current page label
- Navigation filtered by `user.role.name` — must match `ProtectedRoute` allowed roles
- Theme toggle persists to `localStorage` key `transitops-theme`
- `DemoModeBanner` above header when API mock fallback is active
- `<Outlet />` in `.app-content-inner` for page content

### 11.6 UsersPage — Admin User Management

**File:** `frontend/src/pages/UsersPage.jsx`

| Feature | Implementation |
|---|---|
| Stats bar | Total / Active / Inactive users + role count |
| Search | Real-time filter on name + email |
| Role filter | Dropdown populated from `GET /api/roles` |
| User table | Avatar initials, role badge, status badge, last login timestamp |
| Create modal | Form: name, email, password (with show/hide), role select |
| Linked driver | `SearchableSelectField` when role is driver |
| Edit modal | Pre-filled form + `isActive` toggle switch |
| Delete modal | Confirmation dialog before hard delete |
| Audit tab | Filterable audit log table (`GET /api/audit-logs`) with action/resource filters |
| Toast notifications | 3.5s auto-dismiss; success (green) / error (red) |

### 11.7 LoginPage

**File:** `frontend/src/pages/auth/LoginPage.jsx`

- Split-screen aesthetic with light branding/roles pane and dark form pane
- Toggle between "Sign In" and "Create Account"
- Self-registration form captures Name, Email, Password, and Role (RBAC) dropdown
- Password show/hide toggle for both sign in and sign up
- Error and Success alert boxes with icons
- Submit button with spinner during loading
- Card shake animation on failed login/register (CSS `@keyframes shake`)
- Preserves `from` location — redirects back after successful login

### 11.8 VehiclesPage — Vehicle Registry

**File:** `frontend/src/pages/VehiclesPage.jsx`

| Feature | Implementation |
|---|---|
| Stats bar | Total / Available / On Trip / In Shop or Retired |
| Search & Filter | Real-time filter on reg/name/model + Status dropdown |
| Vehicle table | Formatted details, capacity/odometer, status badges |
| Create/Edit modal | React Hook Form + Zod; numeric constraints for capacity/odometer/cost |
| Delete modal | Confirmation dialog; 409 shows Retire alternative |
| Retire action | Row action + delete-modal fallback sets status to `Retired` |
| RBAC UI | Create/Edit/Delete actions hidden from `driver` |

### 11.9 DriversPage — Driver Registry

**File:** `frontend/src/pages/DriversPage.jsx`

| Feature | Implementation |
|---|---|
| Stats bar | Total / Available / On Trip / Off Duty & Suspended counts |
| Search & Filter | Real-time filter on name/licenseNumber/category + Status dropdown |
| Driver table | Avatar initials, license details, expiry date with warning highlights |
| Expiry warnings | Color-coded badges for expired (red) or expiring within 30 days (amber) |
| Safety Score | Color-coded badge: >= 90 green, >= 70 amber, < 70 red |
| Create/Edit modal | React Hook Form + Zod; date picker for expiry |
| Delete modal | Confirmation dialog; 409 shows Set Off Duty alternative |
| Set Off Duty | Row action deactivates driver while preserving trip history |
| RBAC UI | Create/Edit/Delete actions restricted to `admin` and `safety_officer` |

### 11.10 TripsPage — Trip Dispatcher

**File:** `frontend/src/pages/TripsPage.jsx`

| Feature | Implementation |
|---|---|
| Layout | Fixed-height page: header + KPI row + 50/50 master-detail (list \| workspace) on `lg+` |
| Stats bar | Five `StatCard` tiles (stack layout — matches Vehicles/Drivers spacing) |
| List panel | Status pill tabs, debounced `SearchInput`, selectable trip rows |
| Detail / create | Inline workspace for selected trip or new trip form |
| Assignments | `SearchableSelectField` for available vehicle and driver |
| Actions | Dispatch, complete (modal), cancel (confirm) — RBAC gated |
| Long text | `ClampedText` on route/cargo fields with `title` tooltip |

### 11.11 MaintenancePage — Maintenance Workspace

**File:** `frontend/src/pages/MaintenancePage.jsx`

| Feature | Implementation |
|---|---|
| Layout | Section jump nav; left sidebar (log form + recurring schedules); right scrollable service history |
| Vehicle pickers | `SearchableSelectField` on log form and schedule form |
| Form | React Hook Form + Zod; vehicle status sync on save/delete |
| Schedules | List + add recurring schedule form in sidebar |
| History | Search + comfortable table in scroll region |
| RBAC | Write controls for `admin` and `fleet_manager` only |

### 11.12 FinancePage — Fuel & Expenses

**File:** `frontend/src/pages/FinancePage.jsx`

| Feature | Implementation |
|---|---|
| Dual Tab Navigation | Separate `fuelForm` and `expenseForm` (RHF + Zod) per tab — `/fuel` vs `/expenses` |
| Dynamic Data Table | Table columns swap based on the active tab (Liters/Odometer vs Category/Notes) |
| Shared Action Modal | Modal form swaps inputs by tab; `SearchableSelectField` for vehicle and trip |
| Delete confirmation | Modal prompt before deleting fuel/expense records |
| Relational Validation | UI alerts user if the selected trip doesn't belong to the selected vehicle |
| Category Badges | Unique color styling for Expense categories (`Toll`, `Repair`, `Parking`, etc.) |
| RBAC UI | Creation restricted to `admin` and `fleet_manager`; `driver` has read-only access |
| Form validation | React Hook Form + Zod — separate form instances per tab |

**File:** `frontend/src/pages/app/DashboardPage.jsx`

| Feature | Implementation |
|---|---|
| KPI cards | Vehicles, drivers, trips, fuel & maintenance cost totals |
| Fleet utilization | Percentage from API |
| Charts | 6-month trends + fleet status pie (Recharts) |
| Loading | SkeletonKpiGrid |
| API | `GET /api/dashboard/stats` |

### 11.14 ReportsPage — ROI Analytics

**File:** `frontend/src/pages/app/ReportsPage.jsx`

| Feature | Implementation |
|---|---|
| Summary metrics | Fleet utilization, fuel efficiency, operational cost |
| ROI table | Per-vehicle revenue, fuel, expenses + maintenance, net ROI |
| CSV export | Download via `/api/reports/roi/download` |
| API | `GET /api/reports/roi` |

---

## 12. Design System

**Files:** `frontend/src/index.css`, `docs/style-guide.md`

Design tokens live in `index.css` as CSS custom properties (`--color-brand-*`, `--bg-*`, `--text-*`, `--border-*`, semantic success/warning/error). Typography uses **Outfit** (headings) and **Inter** (body) via Google Fonts. Tailwind v4 is loaded through `@tailwindcss/vite`.

Shared layout utilities include `.app-page-stack`, `.app-stat-grid`, `.app-toolbar-card`, `.searchable-select-*`, and page-specific workspaces (e.g. `.app-trips-page`, `.app-maintenance-workspace`).

For the full token table, component specs, and interaction rules, use **`docs/style-guide.md`** — the single source of truth for UI work.

---

## 13. Scripts

### Backend

```bash
./dev            # node server.js (preferred if npm triggers corporate MFA)
npm run dev      # nodemon server.js
npm run start    # node server.js (production)
node seeders/seed.js   # Seed roles + demo data (preferred over npm run seed)
npm run seed     # Same as above via npm
npm test         # Jest — 8 suites
```

### Frontend

```bash
./dev            # Vite dev server (preferred if npm triggers corporate MFA)
npm run dev      # http://localhost:5173
npm run build    # Production build to dist/ (uses .env.production)
npm run lint     # ESLint (required by CI)
npm test         # Vitest
npm run preview  # Preview production build
```

### Docker (repo root)

```bash
docker compose up --build   # MongoDB replica set + API :5000 + frontend :5173
```

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://transitops-han.vercel.app |
| API | https://transitops-yqkc.onrender.com |
| Health | `GET /api/health` |

See **`docs/deployment.md`** for Render/Vercel/Atlas setup.

---

## 14. CI / Testing

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main` with **Node.js 22**:

| Job | Steps |
|-----|-------|
| `backend-ci` | `npm install` → `npm test` |
| `frontend-ci` | `npm install` → `npm test` → `npm run lint` → `npm run build` |

**Backend test suites (53 tests):** `rbac`, `authRegister`, `authForgotPassword`, `escapeRegex`, `tripDispatch`, `trip`, `report`, `driver`.

**Frontend tests (4 tests):** `ProtectedRoute.test.jsx` — auth redirect and role gating.

---

## 15. Default Credentials

See `docs/mock_data.md` for the full table. Password for all seeded accounts: **`Password@123`**

---

## 16. Phase Roadmap

| Phase | Module | Status |
|---|---|---|
| **1** | Authentication & RBAC | ✅ **Complete** |
| **2** | Vehicle Registry | ✅ **Complete** |
| **3** | Driver Management | ✅ **Complete** |
| **4** | Trip Engine | ✅ **Complete** |
| **5** | Maintenance | ✅ **Complete** |
| **6** | Fuel & Expenses | ✅ **Complete** |
| **7** | Dashboard KPIs | ✅ **Complete** |
| **8** | Reports & CSV Export | ✅ **Complete** |
| **9+** | Future enhancements | See `backlog.md` P6 |
