# Testing Plan for BlueScribe

The following outlines the testing strategy to ensure the stability, reliability, and security of the BlueScribe application as it transitions to a web-based architecture.

## 1. Unit Testing

**Goal:** Ensure individual functions and components work in isolation.

**Tools:**

- **Frontend:** Jest + React Testing Library.
- **Backend:** Jest + Supertest (for route testing).

**Coverage Areas:**

- **Frontend Components:** Renders without crashing, UI state management (Roster selections, force creation), authentication components (Login/Register forms).
- **Backend Routes:** API endpoints for rosters (`/api/rosters`), authentication (`/api/auth/*`), file serving (`/api/files/*`), and healthchecks.
- **Utilities:** Parsers, cost calculation logic, and validation scripts (`validate.js`, `utils.js`).

**Execution:**

- Run frontend tests: `npm test` from root.
- Run backend tests: `cd server && npm test`.

## 2. Integration Testing

**Goal:** Verify interactions between the backend API and the database, as well as the file system integrations.

**Tools:**

- Jest + Supertest (backend).
- SQLite in-memory database for testing model associations and queries.

**Coverage Areas:**

- **Database (Sequelize):** Verify user creation, password hashing with bcrypt, roster creation, and ownership constraints.
- **File System:** Ensure `sync.js` successfully clones, fetches, and parses repository files without path traversal vulnerabilities.
- **Authentication Flow:** Verify that unauthenticated requests to protected endpoints return `401 Unauthorized`.

## 3. End-to-End (E2E) Testing

**Goal:** Validate complete user journeys (CUJs) from the browser down to the database.

**Tools:**

- **Playwright:** Automate browser interactions, perform visual testing, and capture video/screenshots of features.

**Automated CUJs (Implemented):**

- **User Registration & Login:** The user can register a new account, the backend creates it securely, and the user can subsequently log in.
- **Game System Loading:** Ensure the app loads the `wh40k-10e` game system from the local mock API correctly.
- **Roster Creation:** After logging in and loading a system, users can create a new `.rosz` roster.
- **Unit Selection:** The user can add detachments/forces and add 3 units successfully to the roster.

**Future E2E Scenarios:**

- Saving a roster to the backend and successfully reloading it on a different session.
- Exporting/downloading the `.rosz` file.

## 4. Security & Vulnerability Testing

**Goal:** Identify and mitigate security risks.

**Tools:**

- **Static Analysis:** `npm audit` for checking dependency vulnerabilities.
- **Container Scanning:** Tools like Trivy or Docker Scout to scan the `node:18-alpine` base image.
- **Runtime Defenses (Implemented):**
  - `helmet`: For securing Express HTTP headers against common attacks (XSS, clickjacking).
  - `express-rate-limit`: For mitigating brute-force attacks on the API (especially `/api/auth/login`).
  - Container runs as non-root `node` user to prevent privilege escalation within the container.
- **Code Reviews:** Manual inspection for path traversal (already mitigated in `app.js`), SQL injection (Sequelize ORM protects against this), and insecure JWT configurations.

## 5. Performance & Stability Testing

**Goal:** Ensure the application remains responsive under load.

**Tools:**

- **K6 / Artillery:** For backend API load testing.
- **Docker Healthchecks (Implemented):** Ensures the backend container automatically restarts if `/api/health` becomes unresponsive.

**Metrics:**

- API response times for `/api/files/*` to ensure large payload streaming (parsing game data) is efficient.
- JWT token handling performance under concurrent load.
