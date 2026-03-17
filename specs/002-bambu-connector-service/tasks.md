---

description: "Task list for Playground.au Bambu Lab connector service"
---

# Tasks: Playground.au Bambu Lab Connector Service

**Input**: Design documents from `/specs/002-bambu-connector-service/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the connector service

- [ ] T001 Create connector project structure under `src/` and `tests/` in `src/` and `tests/`  
- [ ] T002 Initialize Node.js + TypeScript project with strict compiler options in `package.json` and `tsconfig.json`  
- [ ] T003 [P] Configure ESLint and Prettier for strict linting and formatting in `.eslintrc.*` and `.prettierrc.*`  
- [ ] T004 [P] Add npm scripts for `build`, `lint`, `test`, and `typecheck` in `package.json`  
- [ ] T005 Create initial HTTP server entrypoint with basic health route in `src/server.ts`  

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement configuration and environment variable schema in `src/config/index.ts`  
- [ ] T007 [P] Implement secure secrets loading from environment variables in `src/config/secrets.ts`  
- [ ] T008 [P] Add Dockerfile for connector service in `Dockerfile`  
- [ ] T009 [P] Create Docker Compose stack including connector and Postgres in `docker-compose.yml`  
- [ ] T010 Configure Postgres client and migrations in `src/db/client.ts` and `src/db/migrations/`  
- [ ] T011 Implement structured logger wrapper with correlation fields in `src/observability/logger.ts`  
- [ ] T012 [P] Implement metrics registry and basic counters/gauges in `src/observability/metrics.ts`  
- [ ] T013 Implement liveness and readiness endpoints in `src/api/health.routes.ts`  
- [ ] T014 [P] Add CI workflow running `lint`, `test`, `typecheck`, and Docker build in `.github/workflows/ci.yml`  
- [ ] T015 Document environment variables and Docker workflows in `README.md`  

**Checkpoint**: Connector runs in Docker with health endpoints and basic observability

---

## Phase 3: User Story 1 – Connect and Manage Bambu Lab Printers (Priority: P1) 🎯 MVP

**Goal**: Discover, register, and monitor one or more Bambu Lab printers on LAN Developer Mode with normalized state

**Independent Test**: In a dev environment with 1–3 Bambu printers, connector discovers/registers them and exposes accurate normalized state via APIs without involving orders

### Implementation for User Story 1

- [ ] T016 [P] [US1] Define Bambu LAN client interface and error types in `src/adapters/bambuLan/types.ts`  
- [ ] T017 [US1] Implement initial Bambu LAN client for status and metadata in `src/adapters/bambuLan/client.ts`  
- [ ] T018 [US1] Implement Printer entity and normalized status enum in `src/domain/printers/printer.ts`  
- [ ] T019 [US1] Add printers and printer_status_history tables to DB schema in `src/db/migrations/`  
- [ ] T020 [P] [US1] Implement printer repository for CRUD and status history in `src/domain/printers/printer.repository.ts`  
- [ ] T021 [US1] Implement printer discovery and registration service in `src/domain/printers/printer.service.ts`  
- [ ] T022 [US1] Implement printer status poller with backoff and offline detection in `src/domain/printers/printer.poller.ts`  
- [ ] T023 [US1] Expose admin APIs for listing and managing printers in `src/api/admin/printers.routes.ts`  
- [ ] T024 [P] [US1] Add integration tests for printer discovery and normalized state in `tests/integration/admin/printers.test.ts`  
- [ ] T025 [US1] Add structured logging and metrics for printer polling in `src/domain/printers/printer.poller.ts`  

**Checkpoint**: Admin/API callers can see all LAN printers with current normalized state

---

## Phase 4: User Story 2 – Link Orders to Print Attempts (Priority: P1)

**Goal**: Link Playground.au orders and order items to immutable print attempts with full lifecycle and reprint history

**Independent Test**: Using synthetic order items from Printing-web, connector records multiple attempts per item (success/failure) and exposes a complete history via API

### Implementation for User Story 2

- [ ] T026 [US2] Implement OrderItemLink and PrintAttempt entities in `src/domain/jobs/printAttempt.ts`  
- [ ] T027 [US2] Extend DB schema with order_item_links and print_attempts tables in `src/db/migrations/`  
- [ ] T028 [P] [US2] Implement repositories for order item links and print attempts in `src/domain/jobs/printAttempt.repository.ts`  
- [ ] T029 [US2] Implement queue model and print-attempt state machine in `src/domain/jobs/queue.service.ts`  
- [ ] T030 [US2] Implement print-attempt service for creating/retrying attempts in `src/domain/jobs/printAttempt.service.ts`  
- [ ] T031 [US2] Implement dispatch service to select printers and submit jobs via Bambu LAN client in `src/domain/jobs/dispatch.service.ts`  
- [ ] T032 [US2] Implement connector API endpoint for Printing-web to submit jobs in `src/api/integration/jobs.routes.ts`  
- [ ] T033 [US2] Implement connector API endpoint for order-item print history in `src/api/integration/history.routes.ts`  
- [ ] T034 [P] [US2] Implement audit logging for print-attempt lifecycle events in `src/domain/audit/audit.service.ts`  
- [ ] T035 [P] [US2] Add integration tests for multi-attempt history per order item in `tests/integration/integration/history.test.ts`  

**Checkpoint**: Each order item has a clear, immutable attempt history with statuses and reasons

---

## Phase 5: User Story 3 – Stock, Cost, and Timelapse Insights (Priority: P2)

**Goal**: Track filament stock, restock recommendations, power-usage inputs, and timelapses per print attempt

**Independent Test**: With simulated usage and timelapse outputs, connector surfaces stock signals, power estimates, and timelapse metadata via APIs

### Implementation for User Story 3

- [ ] T036 [US3] Implement filament stock and spool entities in `src/domain/stock/stock.ts`  
- [ ] T037 [US3] Extend DB schema for filament_spools, stock_events, and restock_recommendations in `src/db/migrations/`  
- [ ] T038 [P] [US3] Implement stock repository and aggregation in `src/domain/stock/stock.repository.ts`  
- [ ] T039 [US3] Implement material usage tracking on each print attempt in `src/domain/jobs/printAttempt.service.ts`  
- [ ] T040 [US3] Implement restock recommendation engine and demand signals in `src/domain/stock/stock.service.ts`  
- [ ] T041 [US3] Implement power usage tracking/estimation service in `src/domain/costing/power.service.ts`  
- [ ] T042 [US3] Implement TimelapseAsset entity and visibility flags in `src/domain/timelapse/timelapse.ts`  
- [ ] T043 [US3] Implement timelapse retrieval from printers into local/object storage in `src/domain/timelapse/timelapse.fetcher.ts`  
- [ ] T044 [US3] Implement YouTube unlisted upload adapter in `src/adapters/youtube/client.ts`  
- [ ] T045 [US3] Implement timelapse upload job queue and retries in `src/domain/timelapse/timelapse.uploader.ts`  
- [ ] T046 [US3] Implement timelapse visibility policy logic in `src/domain/timelapse/timelapse.policy.ts`  
- [ ] T047 [US3] Expose APIs for stock signals, power usage inputs, and timelapse metadata in `src/api/integration/insights.routes.ts`  
- [ ] T048 [P] [US3] Add integration tests for multi-timelapse per order item and visibility rules in `tests/integration/integration/timelapse.test.ts`  

**Checkpoint**: Stock, cost inputs, and timelapses are available to Printing-web via connector APIs

---

## Phase 6: Security, Threat Modeling, and Auth

**Purpose**: STRIDE modeling, service-to-service auth, admin auth, and secure defaults

- [ ] T049 Document STRIDE threat model for connector in `docs/security/bambu-connector-stride.md`  
- [ ] T050 Implement service-to-service auth middleware for Printing-web calls in `src/auth/serviceAuth.middleware.ts`  
- [ ] T051 Implement admin auth middleware and role checks in `src/auth/adminAuth.middleware.ts`  
- [ ] T052 Implement audit log persistence for admin and sync actions in `src/domain/audit/audit.repository.ts`  

---

## Phase 7: API / Sync Integration with Printing-web

**Purpose**: Finalize integration boundary and sync behaviors

- [ ] T053 Define OpenAPI spec for connector integration endpoints in `specs/002-bambu-connector-service/contracts/connector-openapi.yaml`  
- [ ] T054 Implement REST handlers according to OpenAPI spec in `src/api/integration/*.routes.ts`  
- [ ] T055 [P] Add contract tests for Printing-web ↔ connector API in `tests/contract/connector-api.test.ts`  
- [ ] T056 Document sync failure and retry behavior in `docs/sync-behavior.md`  

---

## Phase 8: Observability and Health Checks

**Purpose**: Logging, metrics, and health signals for production readiness

- [ ] T057 Design log schema and audit strategy in `docs/observability.md`  
- [ ] T058 Implement structured logging fields across domain flows in `src/observability/logger.ts` and callers  
- [ ] T059 Implement detailed health and readiness checks in `src/api/health.routes.ts`  
- [ ] T060 [P] Export core metrics (queue depth, attempts per status, timelapse failures, stock-low counts) in `src/observability/metrics.ts`  

---

## Phase 9: Testing and Validation

**Purpose**: Ensure connector is testable and integration-safe

- [ ] T061 Document multi-level testing strategy in `docs/testing-strategy.md`  
- [ ] T062 [P] Add unit tests for domain modules in `tests/unit/`  
- [ ] T063 [P] Add integration tests for key API flows in `tests/integration/`  
- [ ] T064 [P] Wire contract tests into CI in `.github/workflows/ci.yml`  

---

## Phase 10: Documentation and Runbooks

**Purpose**: Provide clear docs for architecture, integration, and operations

- [ ] T065 Write connector architecture and integration guide in `docs/architecture.md` and `docs/integration.md`  
- [ ] T066 [P] Add operator runbook for printer offline scenarios, backup/restore, and failure handling in `docs/runbook.md`  

---

## Phase 11: Cursor Skills and Developer Workflow

**Purpose**: Ensure /StartApp /StopApp /ResetApp skills work with Docker-only workflows

- [ ] T067 Define behavior of /StartApp, /StopApp, /ResetApp for connector stack in `docs/cursor-skills.md`  
- [ ] T068 Implement Cursor skill configuration mapping to Docker Compose commands in `.cursor/skills/connector-skills.json`  
- [ ] T069 [P] Add automated validation script for skills in `scripts/validate-skills.ps1`  

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately  
- **Foundational (Phase 2)**: Depends on Phase 1 completion – BLOCKS all user stories  
- **User Story 1 (Phase 3)**: Depends on Phases 1–2 – requires TS/Node/Docker and DB basics  
- **User Story 2 (Phase 4)**: Depends on Phases 2–3 – requires printers and queue infrastructure  
- **User Story 3 (Phase 5)**: Depends on Phases 3–4 – requires attempts and printer model  
- **Security (Phase 6)**: Depends on core flows – attaches STRIDE-driven controls  
- **API/Sync (Phase 7)**: Depends on data model and domain – finalizes contracts  
- **Observability (Phase 8)**: Depends on core flows – instruments existing paths  
- **Testing (Phase 9)**: Depends on implemented domains – fills coverage  
- **Docs (Phase 10)**: Depends on architecture and flows – describes final design  
- **Cursor Skills (Phase 11)**: Depends on Docker stack and health endpoints  

### Parallel Opportunities

- All tasks marked [P] can be executed in parallel when their dependencies are met (linting/formatting setup, metrics, tests, skills validation, etc.).  
- After Phase 2, parts of User Story 1 and User Story 2 can be developed in parallel by different contributors.  

---

## Implementation Strategy

### MVP First (User Stories 1 and 2)

1. Complete Phase 1: Setup.  
2. Complete Phase 2: Foundational infrastructure.  
3. Complete Phase 3: User Story 1 (LAN printer discovery and normalized state).  
4. Complete Phase 4: User Story 2 (order-item → attempt history and queue).  
5. **STOP and VALIDATE**: End-to-end flow from Printing-web job submission to immutable attempt history via connector APIs.  

### Phase 2 Delivery (User Story 3 and Hardening)

1. Implement Phase 5: User Story 3 (stock, power, timelapses).  
2. Harden with Phases 6–8 (security, observability, health checks).  
3. Finalize contracts and tests in Phase 7 and Phase 9.  
4. Polish docs and operator workflows in Phase 10.  
5. Validate Cursor skills and automation in Phase 11.  

