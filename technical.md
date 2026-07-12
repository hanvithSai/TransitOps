# TransitOps – Technical Implementation Reference

> **Branch:** `RBAC`
> **Phase:** 1 — Authentication & RBAC
> **Status:** ✅ Complete
> **Stack:** MERN (MongoDB · Express.js · React · Node.js)
> **Last Updated:** 2026-07-12

---

## 1. Project Structure

```
TransitOps/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Login, refresh, logout, getMe
│   │   └── userController.js        # User CRUD
│   ├── middlewares/
│   │   ├── authenticate.js          # JWT Bearer verification
│   │   └── authorize.js             # RBAC role-gate factory
│   ├── models/
│   │   ├── Role.js                  # Role schema
│   │   ├── User.js                  # User schema (bcrypt pre-save)
│   │   └── RefreshToken.js          # Refresh token with TTL index
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth
│   │   ├── userRoutes.js            # /api/users (admin only)
│   │   └── roleRoutes.js            # /api/roles (admin only)
│   ├── seeders/
│   │   └── seed.js                  # Seeds roles + default admin
│   ├── services/
│   │   ├── authService.js           # Auth business logic
│   │   └── userService.js           # User CRUD business logic
│   ├── utils/
│   │   └── errorHandler.js          # AppError class + global handler
│   ├── validators/
│   │   └── authValidator.js         # express-validator rule sets
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx   # Auth + role guard component
    │   ├── contexts/
    │   │   └── AuthContext.jsx      # Auth state + login/logout + useAuth()
    │   ├── layouts/
    │   │   └── AppLayout.jsx        # Collapsible sidebar + top bar
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   └── LoginPage.jsx    # Premium dark login page
    │   │   ├── DashboardPage.jsx    # Phase 1 placeholder
    │   │   ├── UsersPage.jsx        # Admin user management UI
    │   │   └── UnauthorizedPage.jsx # 403 page
    │   ├── services/
    │   │   └── api.js               # Axios instance + interceptors
    │   ├── App.jsx                  # React Router + route definitions
    │   ├── index.css                # Tailwind v4 + design tokens
    │   └── main.jsx                 # React entry point
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

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.7 | UI library |
| `react-dom` | ^19.2.7 | DOM renderer |
| `react-router-dom` | ^7.18.1 | Client-side routing |
| `axios` | ^1.18.1 | HTTP client |
| `tailwindcss` | ^4.3.2 | Utility-first CSS (v4) |
| `@tailwindcss/vite` | ^4.3.2 | Vite integration plugin |
| `vite` | ^8.1.1 | Build tool & dev server |

---

## 3. Environment Variables

**File:** `backend/.env`

```env
MONGO_URI=mongodb+srv://...          # MongoDB Atlas connection string
PORT=5000                            # Express server port
JWT_SECRET=...                       # Access token signing secret
JWT_REFRESH_SECRET=...               # (reserved) Refresh token secret
CLIENT_URL=http://localhost:5173     # Frontend origin for CORS
NODE_ENV=development                 # Environment flag
```

---

## 4. Database Collections (Phase 1)

### 4.1 `roles` Collection

**Model:** [`backend/models/Role.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/models/Role.js)

| Field | Type | Notes |
|---|---|---|
| `name` | String (enum) | `admin` · `fleet_manager` · `dispatcher` · `safety_officer` · `financial_analyst` |
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
| `dispatcher` | Dispatcher | trips, vehicles:read, drivers:read, dashboard |
| `safety_officer` | Safety Officer | drivers, dashboard |
| `financial_analyst` | Financial Analyst | fuel, expenses, reports, dashboard |

### 4.2 `users` Collection

**Model:** [`backend/models/User.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/models/User.js)

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

**Key behaviours:**
- `pre('save')` hook: hashes password with `bcrypt.genSalt(12)` only when `password` field is modified
- `comparePassword(candidate)` instance method: uses `bcrypt.compare`
- Password field never returned in API responses

### 4.3 `refreshtokens` Collection

**Model:** [`backend/models/RefreshToken.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/models/RefreshToken.js)

| Field | Type | Notes |
|---|---|---|
| `token` | String | Unique 64-byte hex random string |
| `user` | ObjectId → User | Owner reference |
| `expiresAt` | Date | 7 days from creation |
| `isRevoked` | Boolean | Set `true` on logout |
| `createdAt` | Date | Auto |

**Key behaviour:**
- MongoDB TTL index on `expiresAt` (`expireAfterSeconds: 0`) — documents auto-deleted by MongoDB when expired

---

## 5. API Endpoints

### 5.1 Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `{ user, accessToken }` + sets `refreshToken` cookie |
| `POST` | `/api/auth/refresh` | Cookie | — | `{ accessToken, user }` |
| `POST` | `/api/auth/logout` | Cookie | — | Clears cookie, revokes token |
| `GET` | `/api/auth/me` | Bearer JWT | — | `{ user }` with role populated |

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

### 5.4 Standard Response Envelope

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
      accessToken  (JWT, 1 day,  stored in localStorage)
      refreshToken (64-byte hex, 7 days, stored in httpOnly cookie)

Access Protected Route
  → Client sends: Authorization: Bearer <accessToken>
  → Server: jwt.verify() → populates req.user

Token Expiry / 401
  → Axios interceptor intercepts 401 (except /login, /refresh)
  → Queues pending requests
  → Calls POST /api/auth/refresh (sends cookie automatically)
  → Issues new accessToken
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
4. Attaches `req.user` for downstream use

**authorize.js:**
- Factory: `authorize(...roles)` returns middleware
- Checks `req.user.role.name` against allowed roles array
- Returns `403` if not in allowed list

### 6.3 Password Security

- Algorithm: `bcrypt` with salt rounds `12`
- Never stored in plaintext
- `select: false` on schema — never returned in queries unless explicitly `+password`
- Minimum 6 characters enforced at validator and schema level

### 6.4 CORS

- Origin locked to `CLIENT_URL` env variable (default: `http://localhost:5173`)
- `credentials: true` — required to send/receive cookies for refresh token

---

## 7. Input Validation

**File:** [`backend/validators/authValidator.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/validators/authValidator.js)

Uses `express-validator`. Three rule sets:

| Validator | Used On | Fields Validated |
|---|---|---|
| `loginValidator` | `POST /api/auth/login` | email (format + normalise), password (min 6) |
| `createUserValidator` | `POST /api/users` | name, email, password, roleId (MongoId) |
| `updateUserValidator` | `PUT /api/users/:id` | All optional — same rules + isActive (boolean) |

---

## 8. Error Handling

**File:** [`backend/utils/errorHandler.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/utils/errorHandler.js)

### AppError Class

```js
throw new AppError("Message", statusCode)
```
All operational errors thrown using `AppError`. Non-operational errors bubble to global handler.

### Global Error Handler (Express middleware)

Normalises errors from multiple sources:

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

**File:** [`backend/services/authService.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/services/authService.js)

| Function | Description |
|---|---|
| `login(email, password)` | Finds user (with `+password`), verifies bcrypt, updates `lastLogin`, issues both tokens |
| `generateAccessToken(userId)` | `jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' })` |
| `generateRefreshToken(userId)` | 64-byte hex via `crypto.randomBytes`, persists to `RefreshToken` collection |
| `refreshAccessToken(token)` | Validates stored token (not revoked, not expired), issues new access token |
| `logout(token)` | Sets `isRevoked: true` on the stored refresh token |
| `getUserById(id)` | Returns user with role populated, no password |

### 9.2 userService.js

**File:** [`backend/services/userService.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/services/userService.js)

| Function | Description |
|---|---|
| `getAllUsers(page, limit)` | Paginated list sorted by `createdAt` desc, role populated |
| `createUser({ name, email, password, roleId })` | Validates role exists, checks duplicate email, creates user (pre-save hook hashes password) |
| `updateUser(id, updates)` | Patches only provided fields; password re-hashed via pre-save hook |
| `deleteUser(id, requestingUserId)` | Prevents self-deletion; hard deletes |
| `getUserById(id)` | Returns single user with full role data |

---

## 10. Seeder

**File:** [`backend/seeders/seed.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/backend/seeders/seed.js)
**Command:** `npm run seed`

**Idempotent** — safe to re-run. Uses `findOneAndUpdate` with `upsert: true`.

**Seeds:**
1. All 5 roles with permissions
2. Admin user: `admin@transitops.com` / `Admin@123`

---

## 11. Frontend Architecture

### 11.1 Routing Structure

**File:** [`frontend/src/App.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/App.jsx)

```
/                     → redirect to /dashboard
/login                → LoginPage (public)
/unauthorized         → UnauthorizedPage (public)

Protected (ProtectedRoute wrapping AppLayout):
  /dashboard          → DashboardPage
  /vehicles           → ComingSoon (Phase 2)
  /drivers            → ComingSoon (Phase 3)
  /trips              → ComingSoon (Phase 4)
  /maintenance        → ComingSoon (Phase 5)
  /fuel               → ComingSoon (Phase 6)
  /expenses           → ComingSoon (Phase 6)
  /reports            → ComingSoon (Phase 8)
  /users              → UsersPage (admin only)

*                     → redirect to /dashboard
```

### 11.2 AuthContext

**File:** [`frontend/src/contexts/AuthContext.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/contexts/AuthContext.jsx)

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
- `logout()` → calls `POST /api/auth/logout`, clears `localStorage`, resets user state
- `clearError()` → clears error message

**Session restoration:** On mount, checks `localStorage` for token → calls `GET /api/auth/me` → sets user or clears storage.

### 11.3 API Service

**File:** [`frontend/src/services/api.js`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/services/api.js)

- **Base URL:** `http://localhost:5000/api`
- **`withCredentials: true`** — sends refresh token cookie on every request
- **Request interceptor:** Reads `accessToken` from `localStorage`, sets `Authorization: Bearer <token>`
- **Response interceptor (token refresh queue):**
  - On `401` (excluding `/login` and `/refresh`): sets `isRefreshing = true`
  - Queues all concurrent failed requests in `failedQueue`
  - Calls `POST /api/auth/refresh` once
  - On success: replays all queued requests with new token
  - On failure: clears `localStorage`, redirects to `/login`

### 11.4 ProtectedRoute

**File:** [`frontend/src/components/ProtectedRoute.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/components/ProtectedRoute.jsx)

**Behaviour:**
1. While `loading === true` → shows full-screen spinner
2. If not authenticated → `<Navigate to="/login" state={{ from: location }} />`
3. If `allowedRoles` provided and user role not in list → `<Navigate to="/unauthorized" />`
4. Otherwise → renders `children`

### 11.5 AppLayout — Sidebar

**File:** [`frontend/src/layouts/AppLayout.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/layouts/AppLayout.jsx)

- Collapsible sidebar (260px expanded / 72px collapsed)
- Toggle button on sidebar edge
- Navigation links filtered by `user.role.name` — each nav item has an `roles[]` whitelist
- Role badge with colour-coded styling per role
- User avatar (initials), online status dot, logout button
- Top header with welcome message and role badge
- `<Outlet />` for nested page content

### 11.6 UsersPage — Admin User Management

**File:** [`frontend/src/pages/UsersPage.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/pages/UsersPage.jsx)

| Feature | Implementation |
|---|---|
| Stats bar | Total / Active / Inactive users + role count |
| Search | Real-time filter on name + email |
| Role filter | Dropdown populated from `GET /api/roles` |
| User table | Avatar initials, role badge, status badge, last login timestamp |
| Create modal | Form: name, email, password (with show/hide), role select |
| Edit modal | Pre-filled form + `isActive` toggle switch |
| Delete modal | Confirmation dialog before hard delete |
| Toast notifications | 3.5s auto-dismiss; success (green) / error (red) |
| Row actions | Edit + delete buttons visible on hover (`group-hover`) |

### 11.7 LoginPage

**File:** [`frontend/src/pages/auth/LoginPage.jsx`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/pages/auth/LoginPage.jsx)

- Animated particle field background (20 random floating dots)
- Gradient mesh background (blue + purple blobs)
- Grid overlay texture
- Glassmorphism card with gradient header
- Email + Password fields with icon prefix
- Password show/hide toggle
- Error alert box with icon
- Submit button with spinner during loading
- Card shake animation on failed login (CSS `@keyframes shake`)
- Demo credentials box
- Preserves `from` location — redirects back after login

---

## 12. Design System

**File:** [`frontend/src/index.css`](file:///c:/Users/vamsh/OneDrive/Desktop/TransitOps/frontend/src/index.css)

### Colour Tokens (CSS Custom Properties)

| Token | Value | Usage |
|---|---|---|
| `--color-brand-400/500/600/700` | Blue spectrum | Primary actions, links, active states |
| `--color-surface-950/900/800/700` | Near-black blues | Page bg, sidebar, cards, hover states |
| `--color-text-primary` | `#f0f4ff` | Headings, values |
| `--color-text-secondary` | `#94a3b8` | Labels, subtext |
| `--color-text-muted` | `#64748b` | Placeholders, captions |
| `--color-border` | `rgba(255,255,255,0.07)` | Dividers |
| `--color-border-light` | `rgba(255,255,255,0.12)` | Input borders, card borders |
| `--color-success` | `#22c55e` | Active status |
| `--color-danger` | `#ef4444` | Error states |
| `--sidebar-width` | `260px` | Sidebar expanded width |

**Typography:** Inter (Google Fonts), weights 300–800
**Tailwind:** v4 with `@tailwindcss/vite` plugin

---

## 13. Scripts

### Backend

```bash
npm run dev    # nodemon server.js (development with auto-restart)
npm run start  # node server.js (production)
npm run seed   # Seed roles + admin user (idempotent)
```

### Frontend

```bash
npm run dev     # Vite dev server (http://localhost:5173)
npm run build   # Production build to dist/
npm run preview # Preview production build
```

---

## 14. Default Credentials

| Email | Password | Role |
|---|---|---|
| `admin@transitops.com` | `Admin@123` | Administrator |

> Additional users are created via the Admin → User Management UI (`/users`)
> or by adding entries to `seeders/seed.js` and running `npm run seed`.

---

## 15. Git

- **Branch:** `RBAC`
- **Commits:**
  - `d3cea43` — `feat(phase-1): Authentication & RBAC module`
  - `dca9699` — `feat(users): Admin User Management UI`

---

## 16. Phase Roadmap

| Phase | Module | Status |
|---|---|---|
| **1** | Authentication & RBAC | ✅ **Complete** |
| 2 | Vehicle Registry | ⏳ Pending |
| 3 | Driver Management | ⏳ Pending |
| 4 | Trip Engine | ⏳ Pending |
| 5 | Maintenance | ⏳ Pending |
| 6 | Fuel & Expenses | ⏳ Pending |
| 7 | Dashboard KPIs | ⏳ Pending |
| 8 | Reports & Bonus Features | ⏳ Pending |
