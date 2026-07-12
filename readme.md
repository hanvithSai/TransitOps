# TransitOps

TransitOps is an end-to-end transport operations platform designed to digitize vehicle, driver, dispatch, maintenance, and expense management. The system enforces strict business rules, ensures data integrity, and provides actionable operational insights for fleet managers, safety officers, and finance analysts.

## Core Features

*   **Driver Management:** Track driver qualifications, employment status, and automate license expiry tracking to ensure continuous regulatory compliance.
*   **Vehicle Lifecycle Management:** Manage fleet inventory including capacity, odometer readings, and status tracking. Enforces defensive data retention by supporting soft deletion (retirement) to preserve historical data integrity.
*   **Trip Dispatch & Tracking:** Seamlessly assign drivers and vehicles to trips. Monitor cargo weights, planned versus actual distances, fuel consumption, and generated revenue.
*   **Maintenance Workflow:** Track maintenance activities, associated repair costs, and vehicle downtime to optimize fleet health and longevity.
*   **Operational Expenses:** Record fuel purchases, tolls, and general operational expenses linked directly to specific trips or vehicles.
*   **Dashboard & Analytics:** Gain high-level visibility into fleet utilization, active trips, and critical key performance indicators.
*   **Financial Reporting:** Generate and export operational cost and return on investment (ROI) reports in CSV format for streamlined financial analysis.

## Technology Stack

The platform is built using the MERN stack with a focus on maintainability and modern development practices.

*   **Frontend:** React 19, Vite, Tailwind CSS, React Router v7, Recharts, Axios.
*   **Backend:** Node.js, Express, MongoDB, Mongoose ORM.
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

*   Node.js (v20 or higher recommended)
*   MongoDB instance (local or Atlas)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on your environment requirements (e.g., PORT, MONGO_URI, JWT_SECRET).
4.  Start the development server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
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

## Documentation

For deeper insights into the project's architectural decisions, database schemas, and product backlog, please refer to the documents located in the `/docs` directory:

*   `Engineering.md`: Architectural decisions and detailed technology stack.
*   `Product.md`: User stories, UX principles, and comprehensive feature breakdowns.
*   `Database.md`: Mongoose schemas, constraints, and index optimizations.