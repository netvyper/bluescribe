Project Name: Bluescribe Web Modernization & NAS Deployment
High-Level Architecture Goal
Transform the existing Bluescribe Tauri desktop application into a containerized Web Application with a dedicated backend API.

Backend (Node.js/Express): Runs on the NAS, automatically clones and keeps the BSData/wh40k-10e repository synced, and serves these raw files via a REST API.

Frontend (React): Stripped of all Tauri desktop dependencies, communicating strictly via standard HTTP fetch to the new backend.

Deployment: A unified docker-compose setup to spin up both services with persistent volumes for the synced data.

Phase 1: Repository Cleanup & Web Isolation
Objective: Strip out the desktop-specific code and ensure the React application can run cleanly as a standard web application.

Task 1.1: Remove Tauri Dependencies

Action: Delete the src-tauri directory completely.

Action: Remove @tauri-apps/api and any other Tauri-specific packages from package.json.

Action: Remove index-tauri.js and update package.json build scripts to use standard react-scripts (or react-app-rewired if config-overrides.js is still strictly needed for web).

Definition of Done: Running npm install and npm start successfully launches the React app in a browser without any Tauri bridge errors.

Task 1.2: Mock/Isolate File System Calls

Action: Identify all components and utilities (e.g., src/repo/FileContents.js, src/utils.js) that previously relied on Tauri's file system API to read local .cat and .gst files.

Action: Refactor these into a centralized apiService.js wrapper. Temporarily mock the returns or leave them as stubbed fetch() calls to /api/data/... so the app compiles without the Tauri API.

Phase 2: Backend Development & Data Synchronization
Objective: Create a lightweight server responsible for managing the GitHub data and serving it to the frontend.

Task 2.1: Initialize Backend Service

Action: Create a new directory named server/ at the root.

Action: Initialize a basic Node.js Express application.

Definition of Done: The server boots up via npm run start in the server/ directory and returns a 200 OK on a health-check endpoint (/api/health).

Task 2.2: Implement GitHub Auto-Sync Service

Action: Integrate simple-git (or standard child_process git commands).

Action: On server startup, check if a local data directory (e.g., ./data/wh40k-10e) exists. If not, perform a git clone https://github.com/BSData/wh40k-10e.git. If it does exist, perform a git pull.

Action: Implement a node-cron job to run git pull once every 12 hours to ensure the data stays up to date automatically.

Definition of Done: The server reliably maintains an up-to-date local copy of the target repository on the host machine.

Task 2.3: Build Data Retrieval Endpoints

Action: Create an endpoint GET /api/systems that returns a list of available game systems/catalogs parsed from the cloned directory.

Action: Create an endpoint GET /api/files/* that securely serves the raw .cat, .gst, and index files from the cloned repository directory to the frontend.

Definition of Done: Postman/cURL can successfully request and download a .cat file from the Express server.

Phase 3: Frontend API Integration
Objective: Connect the modernized React frontend to the newly created backend.

Task 3.1: Wire Up Data Fetching

Action: Update the apiService.js (created in Task 1.2) to point to the new Express backend endpoints.

Action: Refactor the catalog loading logic in src/repo/rosters.js and related components to await the HTTP fetch of the data files rather than reading from a local disk.

Definition of Done: The web UI successfully populates unit lists, profiles, and rules using data served dynamically from the backend.

Task 3.2: Implement Loading States

Action: Network requests take longer than local disk reads. Add visual loading indicators (spinners or skeleton screens) in the React components while catalogs and rosters are being fetched.

Definition of Done: The UI does not freeze or show empty data blocks while waiting for the backend to respond.

Phase 4: Containerization
Objective: Package the application for easy deployment on a NAS using Docker.

Task 4.1: Backend Dockerfile

Action: Create server/Dockerfile. Use a Node alpine image. Ensure git is installed in the image (as the sync service relies on it).

Action: Define a volume mount point for /app/data to ensure the cloned GitHub repo isn't lost when the container restarts.

Task 4.2: Frontend Dockerfile

Action: Create Dockerfile (or frontend.Dockerfile) in the root. Use a multi-stage build: Stage 1 builds the React app via npm run build. Stage 2 uses nginx:alpine to serve the static build folder.

Task 4.3: Docker Compose Assembly

Action: Create docker-compose.yml at the project root.

Action: Define the backend service, mapping port 3001 and mounting a persistent local volume for the git data.

Action: Define the frontend service, mapping port 8080 (or similar) to Nginx.

Action: Configure Nginx to reverse proxy /api requests to the backend container so you don't have to deal with CORS issues in production.

Definition of Done: Running docker compose up --build results in a fully accessible web application that successfully fetches synced repo data.