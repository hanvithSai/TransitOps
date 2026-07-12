# TransitOps – Technical Implementation Reference

> **Branch:** `FuEx`
> **Phases:** 1–6 — Auth, Vehicles, Drivers, Trips, Maintenance, Fuel & Expenses
> **Status:** ✅ Phases 1–6 Complete
> **Stack:** MERN (MongoDB · Express.js · React · Node.js)
> **Last Updated:** 2026-07-12

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
│   │   └── expenseController.js          # Expense CRUD
│   ├── middlewares/
│   │   ├── authenticate.js               # JWT Bearer verification
│   │   └── authorize.js                  # RBAC role-gate factory
│   ├── models/
│   │   ├── Role.js                       # Role schema
│   │   ├── User.js                       # User schema (bcrypt pre-save)
│   │   ├── RefreshToken.js               # Refresh token with TTL index
│   │   ├── Vehicle.js                    # Vehicle schema
│   │   ├── Driver.js                     # Driver schema
│   │   ├── Trip.js                       # Trip schema (compound indexes)
│   │   ├── MaintenanceLog.js             # Maintenance log schema
│   │   ├── FuelLog.js                    # Fuel log schema
│   │   └── Expense.js                    # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js                 # /api/auth
│   │   ├── userRoutes.js                 # /api/users (admin only)
│   │   ├── roleRoutes.js                 # /api/roles (admin only)
│   │   ├── vehicleRoutes.js              # /api/vehicles
│   │   ├── driverRoutes.js               # /api/drivers
│   │   ├── tripRoutes.js                 # /api/trips
│   │   ├── maintenanceRoutes.js          # /api/maintenance
│   │   ├── fuelRoutes.js                 # /api/fuel
│   │   └── expenseRoutes.js              # /api/expenses
│   ├── seeders/
│   │   └── seed.js                       # Seeds roles + default admin
│   ├── services/
│   │   ├── authService.js                # Auth business logic
│   │   ├── userService.js                # User CRUD business logic
│   │   ├── vehicleService.js             # Vehicle CRUD business logic
│   │   ├── driverService.js              # Driver CRUD business logic
│   │   ├── tripService.js                # Trip lifecycle + business rules
│   │   ├── maintenanceService.js         # Maintenance log + vehicle status transitions
│   │   ├── fuelService.js                # Fuel log CRUD logic
│   │   └── expenseService.js             # Expense CRUD logic
│   ├── utils/
│   │   └── errorHandler.js              # AppError class + global handler
│   ├── validators/
│   │   ├── authValidator.js              # express-validator rule sets
│   │   ├── vehicleValidator.js           # Vehicle field rules
│   │   ├── driverValidator.js            # Driver field rules
│   │   ├── tripValidator.js              # Trip field rules
│   │   ├── maintenanceValidator.js       # Maintenance log field rules
│   │   └── financeValidator.js           # Fuel & Expense field rules
│   ├── .env                              # Environment variables
│   ├── server.js                         # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx        # Auth + role guard component
    │   ├── contexts/
    │   │   └── AuthContext.jsx           # Auth state + login/logout + useAuth()
    │   ├── layouts/
    │   │   └── AppLayout.jsx             # Collapsible sidebar + top bar
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   └── LoginPage.jsx         # Premium dark login page
    │   │   ├── DashboardPage.jsx         # Phase 7 placeholder
    │   │   ├── UsersPage.jsx             # Admin user management UI
    │   │   ├── VehiclesPage.jsx          # Vehicle Registry UI
    │   │   ├── DriversPage.jsx           # Driver Registry UI
    │   │   ├── TripsPage.jsx             # Trip management UI
    │   │   ├── MaintenancePage.jsx       # Maintenance split-pane UI
    │   │   ├── FinancePage.jsx           # Tabbed Fuel & Expense UI
    │   │   └── UnauthorizedPage.jsx      # 403 page
    │   ├── services/
    │   │   └── api.js                    # Axios instance + interceptors
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

## 4. Database Collections (Phases 1–6)

### 4.1 `roles` Collection

**Model:** `backend/models/Role.js`

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
| `capacity` | Number | Required, minimum 0.1 (tons) |
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
| `cargoWeight` | Number | Required, >= 0 (tons) |
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

### 5.4 Vehicle Routes — `/api/vehicles`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/vehicles?page=1&limit=20&search=&status=` | admin, fleet_manager, dispatcher | Paginated `{ vehicles, total, page, pages }` |
| `GET` | `/api/vehicles/:id` | admin, fleet_manager, dispatcher | Single `{ vehicle }` |
| `POST` | `/api/vehicles` | admin, fleet_manager | Created `{ vehicle }` |
| `PUT` | `/api/vehicles/:id` | admin, fleet_manager | Updated `{ vehicle }` |
| `DELETE` | `/api/vehicles/:id` | admin, fleet_manager | `{ message }` |

### 5.5 Driver Routes — `/api/drivers`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/drivers?page=1&limit=20&search=&status=` | admin, dispatcher, safety_officer | Paginated `{ drivers, total, page, pages }` |
| `GET` | `/api/drivers/:id` | admin, dispatcher, safety_officer | Single `{ driver }` |
| `POST` | `/api/drivers` | admin, safety_officer | Created `{ driver }` |
| `PUT` | `/api/drivers/:id` | admin, safety_officer | Updated `{ driver }` |
| `DELETE` | `/api/drivers/:id` | admin, safety_officer | `{ message }` |

### 5.6 Trip Routes — `/api/trips`

| Method | Endpoint | Auth Roles | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/trips?page=1&limit=20&search=&status=` | admin, fleet_manager, dispatcher, safety_officer | — | Paginated `{ trips, total, page, pages }` |
| `GET` | `/api/trips/:id` | admin, fleet_manager, dispatcher, safety_officer | — | Single `{ trip }` populated |
| `POST` | `/api/trips` | admin, dispatcher | `{ source, destination, vehicle, driver, cargoWeight, plannedDistance, revenue?, notes? }` | Created `{ trip }` (status: `Draft`) |
| `PUT` | `/api/trips/:id/dispatch` | admin, dispatcher | — | Updated `{ trip }` (status: `Dispatched`) |
| `PUT` | `/api/trips/:id/complete` | admin, dispatcher, fleet_manager | `{ actualDistance, fuelUsed }` | Updated `{ trip }` (status: `Completed`) |
| `PUT` | `/api/trips/:id/cancel` | admin, dispatcher | — | Updated `{ trip }` (status: `Cancelled`) |

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
| `GET` | `/api/fuel?page=1&limit=20&vehicleId=&tripId=` | admin, fleet_manager, dispatcher | Paginated `{ logs, total, page, pages }` populated |
| `GET` | `/api/fuel/:id` | admin, fleet_manager, dispatcher | Single `{ log }` populated |
| `POST` | `/api/fuel` | admin, fleet_manager | Created `{ log }` |
| `PUT` | `/api/fuel/:id` | admin, fleet_manager | Updated `{ log }` |
| `DELETE` | `/api/fuel/:id` | admin, fleet_manager | `{ message }` |

### 5.9 Expense Routes — `/api/expenses`

| Method | Endpoint | Auth Roles | Response |
|---|---|---|---|
| `GET` | `/api/expenses?page=1&limit=20&vehicleId=&tripId=&category=` | admin, fleet_manager, dispatcher | Paginated `{ expenses, total, page, pages }` populated |
| `GET` | `/api/expenses/:id` | admin, fleet_manager, dispatcher | Single `{ expense }` populated |
| `POST` | `/api/expenses` | admin, fleet_manager | Created `{ expense }` |
| `PUT` | `/api/expenses/:id` | admin, fleet_manager | Updated `{ expense }` |
| `DELETE` | `/api/expenses/:id` | admin, fleet_manager | `{ message }` |

### 5.10 Standard Response Envelope

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

Uses `express-validator` across all modules.

| Validator | Used On | Key Fields |
|---|---|---|
| `loginValidator` | `POST /api/auth/login` | email (format + normalise), password (min 6) |
| `createUserValidator` | `POST /api/users` | name, email, password, roleId (MongoId) |
| `updateUserValidator` | `PUT /api/users/:id` | All optional — same rules + isActive (boolean) |
| `createVehicleValidator` | `POST /api/vehicles` | registrationNumber, vehicleName, model, type, capacity (>0.1), odometer (>=0) |
| `updateVehicleValidator` | `PUT /api/vehicles/:id` | All optional — same rules |
| `createDriverValidator` | `POST /api/drivers` | name, licenseNumber, licenseCategory, expiryDate (ISO8601), contact, safetyScore (0–100) |
| `updateDriverValidator` | `PUT /api/drivers/:id` | All optional — same rules |
| `createTripValidator` | `POST /api/trips` | source, destination, vehicle (MongoId), driver (MongoId), cargoWeight (>=0), plannedDistance (>=0) |
| `completeTripValidator` | `PUT /api/trips/:id/complete` | actualDistance (>=0), fuelUsed (>=0) |
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
| `generateAccessToken(userId)` | `jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' })` |
| `generateRefreshToken(userId)` | 64-byte hex via `crypto.randomBytes`, persists to `RefreshToken` collection |
| `refreshAccessToken(token)` | Validates stored token (not revoked, not expired), issues new access token |
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
| `updateDriver(id, data)` | Checks license number uniqueness excluding current; updates |
| `deleteDriver(id)` | Hard deletes driver |

### 9.5 tripService.js

| Function | Description |
|---|---|
| `getAllTrips({ page, limit, status, search })` | Paginated, regex search on source/destination, status filter; fully populated |
| `getTripById(id)` | Returns single fully-populated trip; 404 if not found |
| `createTrip(data, userId)` | Creates a `Draft` trip with `createdBy` set |
| `dispatchTrip(tripId)` | Enforces 9 PRD business rules (vehicle/driver availability, license validity, cargo capacity), transitions to `Dispatched`, sets vehicle → `On Trip`, driver → `On Trip` |
| `completeTrip(tripId, { actualDistance, fuelUsed })` | Transitions `Dispatched` → `Completed`, restores vehicle and driver to `Available` |
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
| `updateLog(id, data)` | Handles status transitions: `Active → Completed` restores vehicle to `Available` if no other active logs; `Completed → Active` puts vehicle back `In Shop` |
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
2. Admin user: `admin@transitops.com` / `Admin@123`

---

## 11. Frontend Architecture

### 11.1 Routing Structure

**File:** `frontend/src/App.jsx`

```
/                     → redirect to /dashboard
/login                → LoginPage (public)
/unauthorized         → UnauthorizedPage (public)

Protected (ProtectedRoute wrapping AppLayout):
  /dashboard          → DashboardPage (placeholder)
  /vehicles           → VehiclesPage (admin, fleet_manager, dispatcher)
  /drivers            → DriversPage (admin, dispatcher, safety_officer)
  /trips              → TripsPage (admin, fleet_manager, dispatcher, safety_officer)
  /maintenance        → MaintenancePage (admin, fleet_manager)
  /fuel               → FinancePage (admin, fleet_manager, dispatcher)
  /expenses           → FinancePage (admin, fleet_manager, dispatcher)
  /reports            → ComingSoon (Phase 8)
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
- `logout()` → calls `POST /api/auth/logout`, clears `localStorage`, resets user state
- `clearError()` → clears error message

**Session restoration:** On mount, checks `localStorage` for token → calls `GET /api/auth/me` → sets user or clears storage.

### 11.3 API Service

**File:** `frontend/src/services/api.js`

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

**File:** `frontend/src/components/ProtectedRoute.jsx`

**Behaviour:**
1. While `loading === true` → shows full-screen spinner
2. If not authenticated → `<Navigate to="/login" state={{ from: location }} />`
3. If `allowedRoles` provided and user role not in list → `<Navigate to="/unauthorized" />`
4. Otherwise → renders `children`

### 11.5 AppLayout — Sidebar

**File:** `frontend/src/layouts/AppLayout.jsx`

- Collapsible sidebar (260px expanded / 72px collapsed)
- Toggle button on sidebar edge
- Navigation links filtered by `user.role.name` — each nav item has a `roles[]` whitelist
- Role badge with colour-coded styling per role
- User avatar (initials), online status dot, logout button
- Top header with welcome message and role badge
- `<Outlet />` for nested page content

### 11.6 UsersPage — Admin User Management

**File:** `frontend/src/pages/UsersPage.jsx`

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
| Create/Edit modal | Form with numeric constraints for capacity/odometer/cost |
| Delete modal | Confirmation dialog before hard delete |
| RBAC UI | Create/Edit/Delete actions hidden from `dispatcher` |

### 11.9 DriversPage — Driver Registry

**File:** `frontend/src/pages/DriversPage.jsx`

| Feature | Implementation |
|---|---|
| Stats bar | Total / Available / On Trip / Off Duty & Suspended counts |
| Search & Filter | Real-time filter on name/licenseNumber/category + Status dropdown |
| Driver table | Avatar initials, license details, expiry date with warning highlights |
| Expiry warnings | Color-coded badges for expired (red) or expiring within 30 days (amber) |
| Safety Score | Color-coded badge: >= 90 green, >= 70 amber, < 70 red |
| Create/Edit modal | Full form with date picker for expiry |
| Delete modal | Confirmation dialog before hard delete |
| RBAC UI | Create/Edit/Delete actions restricted to `admin` and `safety_officer` |

### 11.10 TripsPage — Trip Management

**File:** `frontend/src/pages/TripsPage.jsx`

| Feature | Implementation |
|---|---|
| Stats bar | Draft / Dispatched / Completed / Cancelled counts |
| Search & Filter | Real-time filter on source/destination + Status dropdown |
| Trip table | Populated vehicle and driver names, cargo/distance, timestamps |
| Create modal | Select vehicle + driver, enter cargo weight, planned distance, revenue |
| Dispatch action | Triggers `PUT /api/trips/:id/dispatch` with full business rule enforcement |
| Complete action | Modal with actualDistance and fuelUsed inputs |
| Cancel action | Confirmation before cancellation (Draft only) |
| RBAC UI | Create/Dispatch restricted to `admin`/`dispatcher`; Complete additionally allows `fleet_manager` |

### 11.11 MaintenancePage — Maintenance Logs

**File:** `frontend/src/pages/MaintenancePage.jsx`

| Feature | Implementation |
|---|---|
| Split-pane layout | Left pane: LOG SERVICE RECORD form; Right pane: SERVICE LOGS table |
| Vehicle dropdown | Populated from `/api/vehicles` (non-Retired vehicles) |
| Form fields | Vehicle, Service Type, Cost, Date, Status (Active / Completed) |
| Click-to-edit | Clicking a log row loads it into the left form for editing |
| Status badges | `In Shop` (amber/orange) for `Active`; `Completed` (green) for `Completed` |
| Delete confirmation | Modal prompt before deleting a log |
| Business rule display | Automatic vehicle status updates reflected after save/delete |
| RBAC UI | Write controls restricted to `admin` and `fleet_manager` |

### 11.12 FinancePage — Fuel & Expenses

**File:** `frontend/src/pages/FinancePage.jsx`

| Feature | Implementation |
|---|---|
| Dual Tab Navigation | A single page rendering either Fuel Logs or Expenses depending on URL (`/fuel` vs `/expenses`) |
| Dynamic Data Table | Table columns swap based on the active tab (Liters/Odometer vs Category/Notes) |
| Shared Action Modal | Modal form swaps inputs based on active tab; fetches active Vehicles and Trips for dropdowns |
| Relational Validation | UI alerts user if the selected trip doesn't belong to the selected vehicle |
| Category Badges | Unique color styling for Expense categories (`Toll`, `Repair`, `Parking`, etc.) |
| RBAC UI | Creation restricted to `admin` and `fleet_manager`; `dispatcher` has read-only access |

---

## 12. Design System

**File:** `frontend/src/index.css`

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
| `--color-warning` | `#f59e0b` | Warning states |
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

> Additional users can self-register via the public **Create Account** page (`/login`),
> which creates their accounts in a "pending approval" state (`isActive: false`).
> The Admin must activate them via the User Management UI (`/users`).

---

## 15. Phase Roadmap

| Phase | Module | Status |
|---|---|---|
| **1** | Authentication & RBAC | ✅ **Complete** |
| **2** | Vehicle Registry | ✅ **Complete** |
| **3** | Driver Management | ✅ **Complete** |
| **4** | Trip Engine | ✅ **Complete** |
| **5** | Maintenance | ✅ **Complete** |
| **6** | Fuel & Expenses | ✅ **Complete** |
| 7 | Dashboard KPIs | ⏳ Pending |
| 8 | Reports & Bonus Features | ⏳ Pending |
