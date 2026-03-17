# Quickstart: Playground.au Bambu Lab Connector Service

**Branch**: `002-bambu-connector-service`  
**Date**: 2026-03-17  

## Prerequisites

- Docker and Docker Compose installed.  
- Access to a PostgreSQL-compatible database (local or remote).  
- At least one Bambu Lab printer on the local network in Developer Mode.  

## Two run modes

1. **Local testing (with local Postgres)**
   - Use when developing without the site’s remote Postgres. From the repo root:
     - `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d`
   - This starts `connector-db` (Postgres) and `connector-api`. The local override wires the API to the local DB; `DATABASE_URL` defaults to `postgresql://connector:connector@connector-db:5432/bambu_connector` when using the local file.

2. **Production (remote Postgres)**
   - Use when the site has a remote Postgres (same server as Printing-web or a dedicated DB). Set `DATABASE_URL` in `.env` to that connection string.
   - Run only the API: `docker compose up --build -d`. Only `connector-api` runs; no local Postgres. All connector tables live in the **`connector`** schema.

**SQLite outbox**: When writes to remote Postgres or sync to Printing-web fail, the connector appends to a local SQLite outbox inside the container and a background job replays them when the remote is available again. No extra configuration is required; it is used automatically.

## Steps

1. **Clone and configure env**
   - Copy `.env.example` to `.env` in the connector repo.
   - Fill in `DATABASE_URL` (remote Postgres for production; when using docker-compose.local.yml a default is provided), Bambu LAN settings, `PRINTING_WEB_BASE_URL`, and authentication secrets.

2. **Start services via Docker Compose**
   - **Local testing**: `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d`.
   - **Production**: Set `DATABASE_URL` to remote Postgres, then `docker compose up --build -d`.

3. **Run migrations**
   - Ensure the `connector` schema and tables exist: run `npx prisma migrate deploy` (e.g. inside the connector container or against the same `DATABASE_URL`).

4. **Verify health**
   - Call `GET /health/live` and `GET /health/ready` to ensure the service reports ready.

5. **Connect from Printing-web**
   - Configure Printing-web with the connector base URL and shared auth secret.
   - Use the integration endpoints to submit a test order item and view its print-attempt history.

