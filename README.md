# BlueScribe

BlueScribe is an army list builder for tabletop wargames; it is heavily inspired by and 100% compatible with BattleScribe, reading the same format datafiles and writing rosters in the same format.

Try it out at https://bluewinds.github.io/bluescribe/. It loads and runs in a web browser, no installation or downloads needed. For the moment, it is optimized for desktop machines; while it works on a phone, this has not been tested and is probably a bit finicky. There is no server - everything is stored locally on your computer - and other than downloading or updating game systems, it can be run without internet access. For listing and downloading datafiles, BlueScribe uses the https://jsdelivr.net/ CDN.

There is no tracking, no subscription, no paid features. BlueScribe is GNU GPL 3.0 licensed; you can freely distribute and modify it yourself, though of course I appreciate notice and pull requests if you have improvements!

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
