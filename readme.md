# TransitOps

TransitOps is an end-to-end transport operations platform designed to digitize vehicle, driver, dispatch, maintenance, and expense management. The system enforces strict business rules, ensures data integrity, and provides actionable operational insights for fleet managers, safety officers, and finance analysts.

## Core Features

*   **Driver Management:** Track driver qualifications, employment status, and automate license expiry tracking to ensure continuous regulatory compliance.
*   **Vehicle Lifecycle Management:** Manage fleet inventory including capacity, odometer readings, and status tracking. Vehicles with historical records cannot be hard-deleted; use the **Retire** action to deactivate while preserving trip, maintenance, fuel, and expense history.
*   **Trip Dispatch & Tracking:** Seamlessly assign drivers and vehicles to trips. Monitor cargo weights, planned versus actual distances, fuel consumption, and generated revenue.
*   **Maintenance Workflow:** Track maintenance activities, associated repair costs, and vehicle downtime to optimize fleet health and longevity.
*   **Operational Expenses:** Record fuel purchases, tolls, and general operational expenses linked directly to specific trips or vehicles.
*   **Dashboard & Analytics:** Gain high-level visibility into fleet utilization, active trips, and critical key performance indicators.
*   **Financial Reporting:** Generate and export operational cost and return on investment (ROI) reports in CSV format for streamlined financial analysis.

## Technology Stack

The platform is built using the MERN stack with a focus on maintainability and modern development practices.

*   **Frontend:** React 19, Vite 8, Tailwind CSS v4, React Router v7, Recharts, Axios, React Hook Form, Zod.
*   **Backend:** Node.js, Express 5, MongoDB, Mongoose 9.
*   **Security & Authentication:** JSON Web Tokens (JWT) for stateless authentication and Role-Based Access Control (RBAC). Passwords are encrypted using bcrypt.
*   **Automation:** Node-cron for background tasks (e.g., automated license suspension).
*   **Continuous Integration:** Configured with GitHub Actions for automated testing and strict linting.

## Repository Structure

The project is structured as a monorepo, clearly separating the client application from the server application:

*   `/frontend` - Contains the React Vite client application.
*   `/backend` - Contains the Express Node.js REST API.
*   `/docs` - Contains extended project documentation (Engineering, Product, Database logic).

## Getting Started

### Prerequisites

*   Node.js v20.19+ or v22.12+ (required by Vite 8 / ESLint 10)
*   MongoDB instance (local or Atlas). **Trip dispatch** uses MongoDB transactions — requires a **replica set** (MongoDB Atlas works out of the box; for local dev use `docker compose up` which starts MongoDB as a single-node replica set).

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Copy `.env.example` to `.env` and configure `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `FRONTEND_URL`.
    For password reset emails, configure SMTP in production. In development without SMTP, forgot-password returns an Ethereal preview link in the API response.
4.  Seed roles and demo data (optional):
    ```bash
    npm run seed
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Use Node 20.20.2+ (see `.nvmrc`):
    ```bash
    nvm use
    npm install
    ```
3.  Create a `.env` file and set the backend API URL:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    Opens at `http://localhost:5173` by default. If that port is taken, Vite uses the next available port (e.g. 5174). The backend allows any localhost port in development.

### Docker (full stack)

From the repo root, with Docker installed:

```bash
docker compose up --build
```

- API: `http://localhost:5000` (health: `GET /api/health`)
- Frontend: `http://localhost:5173`
- MongoDB replica set on port `27017` (required for trip dispatch transactions)

Set `JWT_SECRET` in the environment or `.env` before starting (Compose provides a dev default).

### Self-registration

Users can register at `/register`. Password must be **at least 6 characters**. New accounts are created **inactive** until an admin activates them in the Users page. Admins can set **active/inactive** when creating users via the Users page.

## Demo Credentials

After running `npm run seed`, log in with any of these accounts. Password for all: **`Password@123`**

| Role | Email |
|------|-------|
| Admin | `admin@transitops.com` |
| Fleet Manager | `manager@transitops.com` |
| Driver | `driver@transitops.com` |
| Safety Officer | `safety@transitops.com` |
| Financial Analyst | `finance@transitops.com` |

See `docs/mock_data.md` for full seeded dataset details.

## Implementation Status

**MVP Phases 1–8 are complete.** P0–P4 hardening is shipped: mock offline mode, trip dispatch transactions, session security, test coverage (8 backend suites), Docker Compose, health endpoint, and admin audit log UI.

Remaining work is **P6** future product features — see `docs/backlog.md`. Audit: `docs/audit-report.md`.

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/technical.md` | Full technical reference — API routes, services, frontend architecture |
| `docs/Engineering.md` | Engineering decisions and stack overview |
| `docs/Product.md` | Features, user stories, UX principles |
| `docs/Database.md` | Schemas, constraints, indexes |
| `docs/prd.md` | Product requirements document |
| `docs/backlog.md` | **Pending work** — bugs, security, and future items |
| `docs/audit-report.md` | Codebase audit with priority recommendations |
| `docs/validation.md` | Production readiness checklist |
| `docs/mock_data.md` | Seeder credentials and generated data overview |
| `docs/style-guide.md` | Design system v2.1 tokens and component rules |
| `docs/frontend-redesign.md` | Frontend UX evaluation and redesign notes |