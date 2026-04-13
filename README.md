# BannerScribe

**BannerScribe** is a self-hosted, web-based army list builder for tabletop wargames. It is fully compatible with BattleScribe formatting, reading `.cat` and `.gst` datafiles and writing `.ros` rosters.

Unlike standalone desktop clients, **BannerScribe** is designed for the modern home lab. It is a containerized, client-server application built to be deployed on your NAS or home server via Docker. 

**Key Features:**
* **Automated Data Syncing:** The backend server automatically clones and pulls updates from the community GitHub data repositories (e.g., `BSData/wh40k-10e`), keeping your rulesets up to date without manual intervention.
* **Web-First Client:** Access your army lists from any browser on your network. 
* **User Isolation:** Secure your data with built-in JWT authentication and SQLite storage, ensuring your saved rosters are private to your account.
* **No Tracking, No Subscriptions:** 100% free and open-source.

### Acknowledgements & Licensing
**BannerScribe** is a continuation and architectural modernization of the abandoned [BlueScribe](https://github.com/BlueWinds/bluescribe) project, originally created by BlueWinds. 

We are incredibly grateful to the original author for laying the robust groundwork for the React frontend and XML parsing engine. 

This project is licensed under the **GNU GPL 3.0 License**. You can freely distribute, self-host, and modify it yourself. Pull requests and improvements are always welcome!

## Architecture

BlueScribe has evolved into a split-stack containerized web application suitable for self-hosting (e.g., on a NAS):
*   **Backend:** A Node.js/Express server that automatically clones and syncs the 10th Edition WH40k repository every 12 hours from GitHub. It manages authentication (via JWT), uses a SQLite database to track users, and persists data to disk.
*   **Frontend:** A React Single Page Application (SPA) compiled statically and served via Nginx, communicating with the backend over a REST API.

## Deployment Guide

BlueScribe is designed to be orchestrated via Docker Compose. Use the provided `compose.yaml` to spin up both the frontend and backend services in a custom bridge network.

### Prerequisites & Volume Mounts
The backend container requires a persistent volume mount to `/app/data`. This volume will contain:
1.  The cloned WH40k Git repository data.
2.  The SQLite database file (`db.sqlite`).
3.  User-created rosters.

### Environment Variables for Secure Boot
To securely boot the application and seed the initial administrator account, the following environment variables **must** be provided to the backend service:

*   `ADMIN_USERNAME`: The username for the initial admin account.
*   `ADMIN_PASSWORD`: The password for the initial admin account.
*   `ALLOW_REGISTRATION`: Must be set to `true` to allow new user sign-ups. If set to `false`, the `/api/auth/register` endpoint will return a 403 Forbidden.

### Port Configuration
The Nginx frontend container exposes port `80` internally, which is mapped to port `8080` by default in the `compose.yaml`. All requests to `/api/*` are reverse-proxied to the Node.js backend.

To deploy:
```bash
docker compose up --build -d
```

# To build and run for Development

`npm install`
`npm run start`
