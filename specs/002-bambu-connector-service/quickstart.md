# Quickstart: Playground.au Bambu Lab Connector Service

**Branch**: `002-bambu-connector-service`  
**Date**: 2026-03-17  

## Prerequisites

- Docker and Docker Compose installed.  
- Access to a PostgreSQL-compatible Docker image.  
- At least one Bambu Lab printer on the local network in Developer Mode.  

## Steps

1. **Clone and configure env**
   - Copy `.env.example` to `.env` in the connector repo.
   - Fill in DB credentials, Bambu LAN settings, `PRINTING_WEB_BASE_URL`, and authentication secrets.

2. **Start services via Docker Compose**
   - From the repo root, run:
     - `docker compose up --build -d`
   - This starts the connector service and its dedicated Postgres container.

3. **Run migrations**
   - Execute the migration command inside the connector container (e.g. `npm run migrate`).

4. **Verify health**
   - Call the health endpoint (e.g. `GET /health`) to ensure the service reports ready.

5. **Connect from Printing-web**
   - Configure `Printing-web` with the connector base URL and shared auth secret.
   - Use the integration endpoints to submit a test order item and view its print-attempt history.

