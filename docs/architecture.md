# Playground.au Bambu Connector Architecture

## Purpose

The Bambu connector is a separate service that translates Playground.au production intents into LAN printer operations while preserving clear boundaries with `Printing-web`.

## High-level Modules

- `src/api/` - Fastify routes for health, admin, and integration.
- `src/domain/printers/` - Discovery, registration, normalized state, polling.
- `src/domain/jobs/` - Queue and immutable print-attempt lifecycle.
- `src/domain/stock/` - Filament usage, thresholds, and restock signals.
- `src/domain/timelapse/` - Retrieval, upload, and visibility policy.
- `src/domain/costing/` - Power usage estimation.
- `src/adapters/bambuLan/` - LAN-mode printer communication adapter.
- `src/adapters/youtube/` - Unlisted upload adapter.
- `src/auth/` - Service and admin authentication middleware.
- `src/observability/` - Structured logging and metrics.
- `src/db/` - Prisma client and persistence access.
- `src/outbox/` - Local SQLite outbox for resilience when remote Postgres or sync is unavailable.

## Data Stores

- **Primary store**: The connector uses the **site’s remote Postgres** (same server as Printing-web, or a dedicated DB on the same host/network). All connector tables live in a **dedicated schema** (`connector`) so they are clearly separated from site tables and migrations stay isolated.
- **Local resilience**: A **SQLite database** inside the connector container is used only as an **outbox** when:
  - The remote Postgres is unreachable (e.g. sync-event or audit writes fail), or
  - Pushes to Printing-web fail and need to be retried.
- **When we write to Postgres**: All canonical data (printers, attempts, stock, timelapses, audit, sync events) is written to the remote Postgres `connector` schema.
- **When we write to the outbox**: If a write to Postgres fails (e.g. `SyncRepository.record`), the payload is appended to the local SQLite outbox. A background replay loop periodically tries to deliver outbox entries to Postgres; on success they are removed. The outbox is **not** the source of truth and has a retention cap (e.g. 72 hours).

## Service Boundaries

- `Printing-web` owns orders, customers, pricing, and storefront/admin UI.
- Connector owns printers, attempts, stock, timelapses, and sync/audit events.
- Integration is via HTTP API and optional webhook/event payloads.
