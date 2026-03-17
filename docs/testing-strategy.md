# Testing Strategy

## Test Levels

- Unit tests for domain logic (`tests/unit`).
- Integration tests for API routes and service wiring (`tests/integration`).
- Contract tests for API boundary against OpenAPI (`tests/contract`).

## Critical Coverage Areas

- Printer state normalization and polling/offline behavior.
- Queue and immutable print-attempt history.
- Stock signal generation and power estimate payloads.
- Timelapse association and visibility policy.
- Auth middleware behavior for admin and integration routes.
