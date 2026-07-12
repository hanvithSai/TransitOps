# Engineering Documentation

## Engineering Decisions
* **Monorepo Structure:** The project is divided into `frontend` and `backend` folders for clear separation of concerns while keeping them in the same repository for ease of development.
* **REST API:** The backend exposes a RESTful API for the frontend to consume.
* **JWT Authentication:** Used for stateless authentication, with access tokens and refresh tokens.
* **Role-Based Access Control (RBAC):** Users are assigned roles (e.g., Fleet Manager, Safety Officer) to restrict access to certain routes and features.
* **Mongoose ORM:** Chosen to provide schema validation, relationships (via `ref`), and middleware capabilities for MongoDB.

## Tech Stack & Frameworks
* **Frontend:** 
  * React 19
  * Vite (Build tool & dev server)
  * Tailwind CSS (Styling)
  * React Router v7 (Routing)
  * Recharts (Dashboard analytics & visualizations)
  * Axios (HTTP client)
* **Backend:** 
  * Node.js
  * Express (Routing and middleware)
  * MongoDB (Database)
  * Mongoose (ODM)
* **Testing:** Jest, Supertest (Backend API testing)

## Tools & Libraries
* **Backend Dependencies:**
  * `bcryptjs`: Password hashing.
  * `jsonwebtoken`: Generating and verifying JWTs.
  * `node-cron`: Running background tasks (e.g., driver license expiry checks).
  * `nodemailer`: Email notifications.
  * `express-validator`: API request validation.
  * `dotenv`: Environment variable management.
* **Frontend Dev Tools:**
  * `eslint`: Code linting.
  * `@tailwindcss/vite`: Tailwind integration with Vite.
