# Operations Runbook

## Startup

1. Copy `.env.example` to `.env`.
2. Set required secrets and `DATABASE_URL` (for production; for local testing the local Compose file provides a default).
3. **Production**: `docker compose up --build -d`. **Local testing**: `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d` (see [Quickstart](../specs/002-bambu-connector-service/quickstart.md)).
4. Verify `GET /health/live` and `GET /health/ready`.

## Production with Cloudflare Tunnel

The connector is designed to run behind a **Cloudflare Tunnel (cloudflared)** for production so that all public traffic is over HTTPS (TLS terminated at Cloudflare's edge). The connector listens on HTTP inside your network; you configure cloudflared to forward traffic to it (e.g. `http://connector-api:8081`). No inbound ports need to be opened on your host.

**Setup (by the user)**: Install and configure cloudflared, create a tunnel that forwards to the connector service, and point a hostname in your Cloudflare zone at the tunnel. Printing-web and admin tools then call the connector at `https://<your-connector-hostname>`.

**Instructions**: [Cloudflare Tunnel (Connect Apps)](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/). To create a tunnel and route traffic: [Get started with Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/get-started/).

**Secure communications**: Inbound HTTPS is provided by the tunnel. For outbound calls from the connector to Printing-web (`PRINTING_WEB_BASE_URL`), use an `https://` URL in production when available so traffic is encrypted. Local testing may use `http://` (no TLS enforcement in code).

## Connector using remote Postgres

- Set `DATABASE_URL` to the site’s remote Postgres connection string (same DB as Printing-web or a dedicated DB on the same host).
- Connector tables live in the **`connector`** schema. Migrations create and update only that schema.
- To apply migrations: run `npx prisma migrate deploy` (or equivalent) against that `DATABASE_URL` so the `connector` schema and tables exist.
- For production, use `docker compose up -d` (single file); do not use `docker-compose.local.yml`. Run only the connector API with `DATABASE_URL` pointing at the remote DB.

## SQLite outbox

- **Role**: Transient buffer when writes to remote Postgres or pushes to Printing-web fail. It is **not** the system of record.
- **Location**: Inside the container at `$CONNECTOR_DATA_DIR/outbox.sqlite` (default `./data/outbox.sqlite`). Mount a volume if you want the file to survive restarts.
- **Retention**: Entries older than 72 hours are pruned. The replay loop runs about every minute and delivers pending entries to Postgres (or the configured delivery target).
- **Inspect/drain**: To inspect pending rows, open the SQLite file (e.g. `sqlite3 ./data/outbox.sqlite`) and run `SELECT * FROM outbox WHERE delivered_at IS NULL;`. To drain, ensure the remote Postgres is reachable and the connector is running; the replay loop will deliver and remove them. No manual drain step is required under normal operation.

## Common Incidents

### Printer Offline
- Confirm LAN reachability to printer host.
- Check poller logs for retry/backoff events.
- Validate printer remains in Developer Mode.

### Connector Not Ready
- If using local Postgres: check Postgres container health and that you started with `docker-compose.local.yml` (two-file Compose).
- Verify `DATABASE_URL` (remote or local) and migration status (`connector` schema).
- Inspect connector logs for Prisma connectivity errors.

### Timelapse Upload Failures
- Check `YOUTUBE_*` configuration.
- Verify upload status in timelapse assets.
- Retry via `/api/integration/timelapses/:assetId/upload`.

## Backup and Restore

- **Source of truth**: Connector data is in the remote Postgres **connector** schema. Back up that database (or the connector schema) on schedule.
- The SQLite outbox can be excluded from backup or backed up with short retention for debugging only.
- Restore by rehydrating the Postgres DB and replaying migrations (`npx prisma migrate deploy`). Validate readiness and history endpoints after restore.
