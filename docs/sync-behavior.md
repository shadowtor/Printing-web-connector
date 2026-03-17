# Connector Sync Behavior

## Direction and Contracts

- Printing-web submits production jobs through `/api/integration/jobs`.
- Connector exposes attempt history through `/api/integration/history/:printingWebOrderItemId`.
- Connector exposes stock and power insights through `/api/integration/insights/*`.
- Connector can receive webhook/event payloads through `/api/integration/webhooks`.

## Retry and Idempotency

- Job submissions are expected to include stable order item IDs; connector treats each new submission as a new print attempt.
- Printer poller and dispatch loops are resilient to transient errors and continue with interval-based retries.
- Sync event records are persisted in `SyncEvent` table for troubleshooting.

## Failure Modes

- If Printing-web is unavailable, connector continues local queue/attempt tracking and logs sync failures.
- If connector is unavailable, Printing-web should degrade gracefully while preserving core commerce functionality.
- Timelapse upload failures are non-blocking and marked on the asset for later retries.
