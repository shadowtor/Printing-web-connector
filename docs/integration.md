# Integration Guide: Printing-web ↔ Bambu Connector

## Connector Endpoints

- `POST /api/integration/jobs` - submit an order item print job.
- `GET /api/integration/history/:printingWebOrderItemId` - retrieve immutable attempt history.
- `GET /api/integration/insights/stock-signals` - stock and low-signal state.
- `POST /api/integration/insights/power-estimate` - estimate power usage.
- `POST /api/integration/timelapses` - create timelapse records.
- `GET /api/integration/timelapses/:printingWebOrderItemId` - list timelapses for order item attempts.

## Authentication

- Integration routes require `x-service-auth` header matching `SERVICE_AUTH_SHARED_SECRET`.
- Admin routes require `x-admin-auth` header matching `ADMIN_AUTH_SECRET`.

## Contract Source of Truth

- `specs/002-bambu-connector-service/contracts/connector-openapi.yaml`
