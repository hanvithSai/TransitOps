# TransitOps – Product Requirements Document (PRD)

> **Project:** TransitOps – Smart Transport Operations Platform
>
> **Tech Stack:** MERN (MongoDB, Express.js, React, Node.js)
>
> **Purpose:** Production-grade submission for the ODOO Hiring Hackathon.

---

# 1. Product Vision

TransitOps is a centralized fleet operations platform that digitizes the complete transport lifecycle, enabling organizations to manage vehicles, drivers, trips, maintenance, fuel, expenses, and analytics from a single system.

The platform emphasizes:
- Operational efficiency
- Business rule enforcement
- Real-time fleet visibility
- Financial transparency
- Scalable architecture

---

# 2. Goals

## Business Goals

- Replace spreadsheet-based fleet management
- Prevent invalid dispatches
- Improve fleet utilization
- Reduce maintenance issues
- Track operational costs
- Provide actionable analytics

## Technical Goals

- Clean Architecture
- Modular MERN codebase
- RBAC Authentication
- RESTful APIs
- Production-ready folder structure
- Centralized validation
- Reusable React components
- Scalable MongoDB schema

---

# 3. User Roles

## Fleet Manager
- Manage vehicles
- Schedule maintenance
- Monitor fleet utilization

## Driver
- Create trips
- Assign drivers
- Assign vehicles
- Dispatch trips

## Safety Officer
- Manage drivers
- Monitor license expiry
- Review safety score

## Financial Analyst
- Track fuel
- Record expenses
- Review ROI
- Export reports

---

# 4. Functional Modules

1. Authentication & RBAC
2. Dashboard
3. Vehicle Registry
4. Driver Management
5. Trip Management
6. Maintenance
7. Fuel Management
8. Expense Management
9. Reports & Analytics
10. Administration

---

# 5. System Architecture

Frontend
- React
- Vite
- React Router
- Context API
- Axios
- Tailwind CSS

Backend
- Node.js
- Express.js

Database
- MongoDB
- Mongoose ODM

Security
- JWT
- bcrypt
- RBAC Middleware

Architecture Layers

Client
→ Routes
→ Controllers
→ Services
→ Repositories (Models)
→ MongoDB

Business rules live only in the Service layer.

---

# 6. Core Collections

- users
- roles
- vehicles
- drivers
- trips
- maintenance_logs
- fuel_logs
- expenses
- vehicle_documents (bonus)
- audit_logs
- notifications (bonus)

---

# 7. Module Requirements

## Authentication

Features
- Login
- JWT Authentication
- Role-based Authorization
- Protected Routes

Acceptance Criteria
- Only authenticated users access the system.
- Unauthorized routes return HTTP 401/403.

---

## Dashboard

KPIs
- Total Vehicles
- Available Vehicles
- On Trip
- In Shop
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Total Fuel Cost
- Maintenance Cost

Charts
- Trips by Month
- Fuel Consumption
- Fleet Status
- Maintenance Trend

---

## Vehicle Registry

Fields
- Registration Number (Unique)
- Vehicle Name
- Model
- Type
- Maximum Load Capacity
- Odometer
- Acquisition Cost
- Status

Status
- Available
- On Trip
- In Shop
- Retired

Validation
- Registration unique
- Capacity > 0
- Odometer >= 0

---

## Driver Management

Fields
- Name
- License Number
- License Category
- Expiry Date
- Contact
- Safety Score
- Status

Validation
- License unique
- Expiry required
- Contact required

Status
- Available
- On Trip
- Off Duty
- Suspended

---

## Trip Management

Lifecycle

Draft
→ Dispatched
→ Completed

or

Draft
→ Cancelled

Fields
- Source
- Destination
- Vehicle
- Driver
- Cargo Weight
- Planned Distance
- Revenue (recommended)
- Actual Distance
- Fuel Used

Validation
- Vehicle available
- Driver available
- License valid
- Cargo within capacity
- Vehicle not in shop
- Driver not suspended

---

## Maintenance

Fields
- Vehicle
- Type
- Description
- Cost
- Open Date
- Close Date
- Status

Business Rules
Opening maintenance
→ Vehicle becomes In Shop

Closing maintenance
→ Vehicle becomes Available

---

## Fuel Logs

Fields
- Vehicle
- Trip
- Liters
- Cost
- Date
- Odometer

---

## Expenses

Types
- Toll
- Repair
- Parking
- Insurance
- Miscellaneous

Fields
- Vehicle
- Trip
- Amount
- Category
- Notes
- Date

---

## Reports

Metrics
- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Vehicle ROI

Exports
- CSV (Mandatory)
- PDF (Bonus)

---

# 8. Mandatory Business Rules

- Vehicle registration must be unique.
- Retired/In Shop vehicles cannot be dispatched.
- Suspended or expired-license drivers cannot be assigned.
- Driver and vehicle cannot participate in multiple active trips.
- Cargo cannot exceed vehicle capacity.
- Dispatch updates vehicle and driver status.
- Completion restores availability.
- Maintenance blocks dispatch.
- Closing maintenance restores availability unless retired.

---

# 9. API Modules

/auth
/users
/roles
/vehicles
/drivers
/trips
/maintenance
/fuel
/expenses
/dashboard
/reports

Controllers remain thin.
Services contain business logic.

---

# 10. Folder Structure

backend/

config/

middlewares/

routes/

controllers/

services/

models/

validators/

utils/

frontend/

components/

features/

pages/

hooks/

contexts/

services/

types/

layouts/

---

# 11. Non-functional Requirements

Performance
- Pagination
- Indexed queries
- Aggregation pipelines

Security
- Password hashing
- JWT
- Input validation
- Sanitization

Scalability
- Modular services
- Repository separation
- Reusable UI components

Maintainability
- Type-safe DTO patterns (JSDoc or TS if adopted)
- Consistent error handling
- Logging middleware

---

# 12. Milestones

Phase 1
- Authentication
- Project setup
- Database

Phase 2
- Vehicle Management

Phase 3
- Driver Management

Phase 4
- Trip Engine

Phase 5
- Maintenance

Phase 6
- Fuel & Expenses

Phase 7
- Dashboard

Phase 8
- Reports & Bonus Features

---

# 13. Success Criteria

Mandatory
- Authentication
- CRUD
- Dispatch workflow
- Automatic state transitions
- Dashboard KPIs
- Fuel & expense tracking
- CSV Export

Bonus
- Charts
- PDF Export
- Vehicle Documents
- Email reminders
- Dark mode

---

# 14. Future Enhancements

- Live GPS Tracking
- Route Optimization
- Predictive Maintenance
- IoT Integration
- Mobile Driver App
- AI Cost Forecasting