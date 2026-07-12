# TransitOps Production Readiness Validation Checklist

This checklist is structured by priority to ensure complete production readiness for the TransitOps platform. It covers backend, frontend, security, and infrastructure validations.

---

# 1. Authentication & RBAC

## Feature / Functionality
### Current Implementation
- **Complete**: JWT-based login, role-based access control (admin, fleet_manager, driver, safety_officer, financial_analyst), `ProtectedRoute.jsx` for UI.
- **Partial**: Token refresh mechanism (exists but needs concurrent request handling check).
- **Missing**: Account lockout on failed attempts, password reset flow.

### Business Logic Validation
- □ User cannot access endpoints outside their assigned role permissions.
- □ Inactive/suspended users are immediately blocked from logging in or using active tokens.
- □ Passwords must be securely hashed before saving (already in `User.js`, verify it's never bypassed).

### Functional Test Cases
**Test 1: Unauthorized Access Prevention**
- **Given** an authenticated user with the 'driver' role
- **When** they attempt to execute a `DELETE /api/vehicles/:id` request
- **Then** the API returns a `403 Forbidden` and the action is blocked.

**Test 2: Token Refresh Flow**
- **Given** a user with an expired access token but valid refresh token
- **When** they navigate to a protected page
- **Then** the app seamlessly requests a new access token and loads the page without forcing a re-login.

### Edge Cases
- Login with non-existent email or wrong password.
- Tampered or malformed JWT token in the `Authorization` header.
- Deleted user attempting to use an unexpired token.
- Role permissions modified while the user has an active session.
- Double-clicking the login button.

### Validation Checklist
- □ Email format validation (`/^\S+@\S+\.\S+$/`)
- □ Password length validation (min 6 characters)
- □ Required fields for User creation
- □ Server-side role verification middleware
- □ Client-side route protection

---

# 2. Vehicles

## Feature / Functionality
### Current Implementation
- **Complete**: CRUD operations, pagination, search, status enum, soft-delete prevention (cannot delete if associated records exist).
- **Partial**: Vehicle lifecycle management.
- **Missing**: Image uploads for vehicles, detailed technical specifications schema.

### Business Logic Validation
- □ Vehicle registration number must be strictly unique (case-insensitive).
- □ Vehicle cannot be hard-deleted if it has associated Trips, Maintenance, Fuel, or Expenses.
- □ Capacity and Odometer must not be negative.
- □ Status transitions must be logical (e.g., cannot go to 'In Shop' if 'On Trip').

### Functional Test Cases
**Test 1: Prevent Deletion of Active Vehicle**
- **Given** a vehicle that has completed at least one trip
- **When** the admin attempts to delete the vehicle
- **Then** the API returns `409 Conflict` with a message to retire it instead.

**Test 2: Duplicate Registration**
- **Given** an existing vehicle with registration "ABC-123"
- **When** a user tries to create or update another vehicle to "abc-123"
- **Then** the API returns `409 Conflict` indicating duplicate registration.

### Edge Cases
- Creating a vehicle with 0 or negative capacity.
- Updating a vehicle's odometer to a lower value than its current state (prevent odometer rollback).
- Concurrent creation of two vehicles with the same registration number.
- Extremely large numbers for acquisition cost.

### Validation Checklist
- □ Required fields (registrationNumber, vehicleName, model, type, capacity, odometer).
- □ Unique index on `registrationNumber`.
- □ Numeric validation (min 0.1 for capacity, min 0 for odometer/cost).
- □ Enum validation for status ('Available', 'On Trip', 'In Shop', 'Retired').
- □ Client-side form validation matching backend rules.

---

# 3. Drivers

## Feature / Functionality
### Current Implementation
- **Complete**: CRUD operations, pagination, safety score, license tracking, delete protections.
- **Partial**: License expiry warnings.
- **Missing**: Shift tracking, hours-of-service compliance.

### Business Logic Validation
- □ Driver license number must be strictly unique.
- □ Driver cannot be deleted if associated with any trips; must be set to 'Off Duty'.
- □ Safety score must remain between 0 and 100.
- □ Expired license blocks trip dispatch (enforced in `tripService.js`).

### Functional Test Cases
**Test 1: License Expiry Block**
- **Given** a driver whose `expiryDate` is in the past
- **When** a dispatcher attempts to assign them to a new Trip
- **Then** the dispatch fails with a `400 Bad Request` and specific error message.

**Test 2: Safety Score Bounds**
- **Given** an API request to update a driver
- **When** the safety score is set to 105
- **Then** the database validation fails and returns `400 Bad Request`.

### Edge Cases
- Updating driver status while they are currently 'On Trip'.
- Expired license date exactly matches today's date.
- Concurrent updates to the same driver record.
- Empty string for contact number.

### Validation Checklist
- □ Required fields (name, licenseNumber, licenseCategory, expiryDate, contact).
- □ Unique index on `licenseNumber`.
- □ Date validation (expiryDate must be a valid date).
- □ Enum validation for status ('Available', 'On Trip', 'Off Duty', 'Suspended').
- □ Numeric boundaries for safetyScore (0-100).

---

# 4. Trips

## Feature / Functionality
### Current Implementation
- **Complete**: Complex dispatch logic (10 rules), trip completion, status enums, related entity status syncing.
- **Partial**: Revenue and actual distance calculations.
- **Missing**: Multi-stop routing, live GPS tracking.

### Business Logic Validation
- □ Trip can only be dispatched from 'Draft' state.
- □ Assigned Vehicle must be 'Available' (not 'Retired' or 'In Shop').
- □ Assigned Driver must be 'Available' (not 'Suspended' or 'On Trip').
- □ Driver license must be valid (not expired).
- □ Cargo weight cannot exceed vehicle capacity.
- □ Vehicle and Driver cannot be in another active ('Dispatched') trip concurrently.
- □ Completing a trip must restore Vehicle and Driver statuses to 'Available'.
- □ Only 'Draft' trips can be Cancelled.

### Functional Test Cases
**Test 1: Cargo Weight Validation**
- **Given** a vehicle with a 5-ton capacity and an available driver
- **When** a trip is dispatched with a cargo weight of 6 tons
- **Then** the API returns `400 Bad Request` citing capacity exceeded.

**Test 2: Trip Completion Sync**
- **Given** an actively dispatched trip
- **When** the trip is marked as 'Completed'
- **Then** the trip status updates to 'Completed', AND the associated vehicle and driver statuses immediately change to 'Available'.

### Edge Cases
- Concurrent dispatch requests for the same vehicle or driver (Race conditions).
- Completing a trip that was already cancelled.
- Setting negative actual distance or negative fuel used upon completion.
- Dispatched trip left open indefinitely (stale trip).
- Assigned vehicle is deleted or retired right before dispatch.

### Validation Checklist
- □ Required fields (source, destination, vehicle, driver, cargoWeight, plannedDistance).
- □ Business validation across related collections (Vehicle capacity, Driver license).
- □ Status transition enforcement (Draft -> Dispatched -> Completed).
- □ Server-side transaction safety for dispatch and completion (to prevent race conditions).
- □ Valid ObjectIds for vehicle and driver references.

---

# 5. Maintenance

## Feature / Functionality
### Current Implementation
- **Complete**: CRUD, vehicle association, cost tracking.
- **Partial**: Automated vehicle status toggling (In Shop / Available).
- **Missing**: Recurring maintenance schedules based on odometer.

### Business Logic Validation
- □ Maintenance log must be tied to a valid Vehicle.
- □ Cost must be a positive number.
- □ Status transitions should accurately reflect whether the vehicle is 'In Shop' or 'Available'.

### Functional Test Cases
**Test 1: Maintenance Creation**
- **Given** an available vehicle
- **When** a maintenance log is created with status 'Active'
- **Then** the log is saved and the vehicle's status should ideally reflect 'In Shop'.

### Edge Cases
- Deleting a vehicle that has historical maintenance logs.
- Negative maintenance cost.
- Future dates for maintenance logs (unless planned).

### Validation Checklist
- □ Reference validation (Vehicle exists).
- □ Enum validation ('Active', 'Completed').
- □ Numeric validation (cost >= 0).

---

# 6. Finance (Fuel & Expenses)

## Feature / Functionality
### Current Implementation
- **Complete**: Fuel logs and general expenses, associated with vehicles and optionally trips, category enums.
- **Partial**: Aggregate financial reporting.
- **Missing**: Receipt image uploads, approval workflows for large expenses.

### Business Logic Validation
- □ Fuel and Expenses must link to a valid Vehicle.
- □ Expenses must fall into valid categories ('Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous').
- □ Liters, cost, and amount must be greater than 0.
- □ Odometer reading on Fuel log cannot be negative and should ideally be >= the vehicle's current odometer.

### Functional Test Cases
**Test 1: Expense Categorization**
- **Given** an expense creation request
- **When** the category is set to 'Food' (invalid)
- **Then** the API rejects it with a `400 Bad Request` schema validation error.

### Edge Cases
- Expense tied to a deleted Trip.
- Fuel log with 0 liters or 0 cost.
- Missing 'createdBy' user reference.

### Validation Checklist
- □ Required fields (vehicle, amount/cost, category/liters).
- □ Enum validation for Expense categories.
- □ Date validation (default to now, prevent absurd future dates).

---

# 7. API Validation

## Verify
- □ **Status Codes**: Correct use of 200, 201, 400, 401, 403, 404, 409, 500.
- □ **Error Messages**: Consistent JSON error structure `{ status: "fail", message: "..." }`.
- □ **Response Consistency**: Consistent pagination wrappers `{ data, total, page, pages }`.
- □ **Validation Errors**: Clear, field-specific Mongoose validation messages returned to the client.
- □ **Invalid Payload**: Rejecting unexpected fields or malformed JSON.
- □ **Missing Payload**: Graceful handling of empty request bodies.
- □ **Invalid ObjectId**: Catching cast errors before they crash the server.
- □ **Resource Not Found**: 404s for querying deleted or non-existent IDs.

---

# 8. UI Validation

## Verify
- □ **Loading States**: Spinners/skeletons visible during API calls to prevent double-clicks.
- □ **Empty States**: Clear messaging when tables/lists have no data.
- □ **Success Messages**: Toast notifications for creates, updates, and deletes.
- □ **Error Messages**: Toast notifications explaining exactly why an action failed.
- □ **Disabled Buttons**: Submit buttons disabled while submitting or if form is invalid.
- □ **Confirmation Dialogs**: Modals confirming destructive actions (Delete, Cancel Trip).
- □ **Responsive Layout**: Tables scroll horizontally on mobile; sidebar collapses.
- □ **Form Validation**: Client-side regex, required fields, and numeric bounds matching backend.
- □ **Data Refresh**: Tables automatically re-fetch data after a mutation (create/edit/delete).

---

# 9. Database Validation

## Verify
- □ **Required Fields**: Enforced at the Mongoose schema level.
- □ **Unique Indexes**: Created for `registrationNumber`, `licenseNumber`, `email`.
- □ **References**: `ref` properties correctly pointing to valid collections.
- □ **Cascading Behaviour**: Handled via application logic (preventing deletes if children exist).
- □ **Transactions**: (High Priority) Dispatching a trip touches 3 collections; must use MongoDB transactions to prevent partial updates.
- □ **Audit History**: `timestamps: true` is on all schemas; `createdBy` is tracked for Trips/Expenses/Fuel.

---

# 10. Security Checklist

## Verify
- □ **Authentication**: All non-auth routes require a valid JWT.
- □ **Authorization**: RBAC middleware successfully blocks unauthorized roles.
- □ **JWT Expiry**: Short-lived access tokens (e.g., 15m) and secure refresh tokens.
- □ **Password Hashing**: Bcrypt with salt rounds >= 10.
- □ **Input Sanitization**: Express-mongo-sanitize to prevent NoSQL injection.
- □ **XSS Prevention**: Helmet middleware, React's native escaping.
- □ **Sensitive Data Exposure**: Passwords never returned in API responses (`select: false`).
- □ **Rate Limiting**: Apply express-rate-limit to login/auth endpoints.
- □ **Environment Variables**: `.env` file excluded from version control; secrets are complex.

---

# 11. Performance Checklist

## Verify
- □ **Pagination**: Implemented on all list endpoints (Vehicles, Drivers, Trips).
- □ **Search & Filters**: Offloaded to MongoDB queries, not filtered in-memory on the client.
- □ **Indexed Queries**: Compound indexes exist for frequent lookups (e.g., `Trip: {vehicle: 1, status: 1}`).
- □ **Aggregation Performance**: Use `$match` early in pipelines for dashboard stats.
- □ **React Re-render Optimization**: Use `useMemo` and `useCallback` for heavy data grids.
- □ **API Response Time**: Endpoints resolve within acceptable thresholds (< 200ms).

---

# 12. Error Handling

## Verify
- □ **Global Error Handler**: Express middleware catching unhandled promise rejections.
- □ **Duplicate Key**: Mongoose code 11000 transformed into readable 409 Conflict messages.
- □ **Network Failure**: Frontend gracefully displays "Network Error" toast if backend is unreachable.
- □ **Internal Server Error**: 500 errors logged internally but scrubbed of stack traces in production responses.

---

# 13. Manual Testing Checklist

Follow this workflow in a staging environment to guarantee end-to-end functionality:

1. **Login & RBAC**: Log in as Admin. Attempt to access all pages. Log out. Log in as Driver. Verify restricted access.
2. **Create Entities**: Create a Vehicle (capacity 10). Create a Driver (valid license).
3. **Draft Trip**: Create a Trip using the new Vehicle and Driver.
4. **Dispatch Trip**: Transition Trip to 'Dispatched'.
5. **Verify Locks**: Attempt to delete the Vehicle. Attempt to dispatch another trip with the same Driver. Both must fail.
6. **Log Expenses**: Add a Fuel Log and a Toll Expense to the active Vehicle.
7. **Complete Trip**: Mark the Trip as Completed.
8. **Verify Restoration**: Ensure the Vehicle and Driver are 'Available' again.
9. **Dashboard Analytics**: Verify the dashboard reflects the new trip, revenue, and expenses.

---

# 14. Technical Debt & Improvements (Nice-to-Have)

- **MongoDB Transactions**: Wrap `tripService.dispatchTrip` and `completeTrip` in `session.withTransaction()` to ensure atomic updates across Vehicle, Driver, and Trip collections. Currently vulnerable to race conditions or partial failures.
- **Concurrent Request Handling**: Implement a mutex or optimistic concurrency control (versioning) on the Vehicle/Driver status to prevent rapid double-clicks from double-dispatching.
- **Frontend State Management**: Transition from heavy prop-drilling or local state to React Query (TanStack Query) for advanced caching, background refetching, and simplified loading states.
- **Data Archiving**: Implement cron jobs to archive old completed trips to a cold collection to keep the main Trip collection fast.
- **Automated Testing**: Expand Jest coverage to include integration tests for API endpoints using Supertest.
