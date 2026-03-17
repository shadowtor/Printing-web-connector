# Operations Runbook

## Startup

1. Copy `.env.example` to `.env`.
2. Set required secrets and `DATABASE_URL`.
3. Run `docker compose up --build -d` (or with `--profile local-db` for local Postgres; see [Quickstart](../specs/002-bambu-connector-service/quickstart.md)).
4. Verify `GET /health/live` and `GET /health/ready`.

## Connector using remote Postgres

- Set `DATABASE_URL` to the site’s remote Postgres connection string (same DB as Printing-web or a dedicated DB on the same host).
- Connector tables live in the **`connector`** schema. Migrations create and update only that schema.
- To apply migrations: run `npx prisma migrate deploy` (or equivalent) against that `DATABASE_URL` so the `connector` schema and tables exist.
- For production, do **not** start the Compose Postgres service (`connector-db`); run only the connector API with `DATABASE_URL` pointing at the remote DB.

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
- If using local Postgres: check Postgres container health and that you started with `--profile local-db`.
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
