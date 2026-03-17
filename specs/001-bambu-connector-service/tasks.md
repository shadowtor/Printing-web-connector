---

description: "Task list for Playground.au Bambu Lab connector service"
---

# Tasks: Playground.au Bambu Lab Connector Service

**Input**: Design documents for `001-bambu-connector-service` (spec, plan, future data-model, contracts)  
**Prerequisites**: plan.md (required), spec.md (user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the connector service

- [ ] T001 Create connector project structure under src/ and tests/ in `src/` and `tests/`  
- [ ] T002 Initialize Node.js + TypeScript project with strict compiler options in `package.json` and `tsconfig.json`  
- [ ] T003 [P] Configure ESLint and Prettier for strict linting and formatting in `.eslintrc.*` and `.prettierrc.*`  
- [ ] T004 [P] Add npm scripts for `build`, `lint`, `test`, and `typecheck` in `package.json`  
- [ ] T005 Create initial HTTP server entrypoint with health placeholder in `src/server.ts`  

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define configuration and environment variable schema in `src/config/index.ts`  
- [ ] T007 [P] Implement secrets loading from environment variables only (no hardcoded secrets) in `src/config/secrets.ts`  
- [ ] T008 [P] Add Dockerfile for connector API in `Dockerfile`  
- [ ] T009 [P] Create docker-compose stack including connector and Postgres in `docker-compose.yml`  
- [ ] T010 Configure Postgres client and migration tool (e.g. Prisma/Kysely) in `src/db/client.ts` and migration folder  
- [ ] T011 Implement structured logger wrapper with correlation fields in `src/observability/logger.ts`  
- [ ] T012 [P] Define metrics exporter and basic counters/gauges in `src/observability/metrics.ts`  
- [ ] T013 Implement liveness and readiness endpoints in `src/api/health.ts` and route wiring  
- [ ] T014 [P] Set up GitHub Actions (or equivalent) workflow running `lint`, `test`, `typecheck`, and Docker build in `.github/workflows/ci.yml`  
- [ ] T015 Document environment variables and Docker workflows in `README.md`  

**Checkpoint**: Foundational stack ready – connector can run in Docker and expose basic health

---

## Phase 3: User Story 1 – Connect and Manage Bambu Lab Printers (Priority: P1) 🎯 MVP

**Goal**: Discover, register, and monitor one or more Bambu Lab printers on LAN Developer Mode with normalized state

**Independent Test**: In a dev environment with one or more LAN Bambu printers, connector discovers/registers them, surfaces metadata and normalized states via admin/API without involving real customer orders

### Implementation for User Story 1

- [ ] T016 [P] [US1] Design Bambu LAN client interface and error types in `src/adapters/bambu-lan/types.ts`  
- [ ] T017 [US1] Implement initial Bambu LAN client (status and metadata fetch) in `src/adapters/bambu-lan/client.ts`  
- [ ] T018 [US1] Define Printer entity and normalized status enum in `src/domain/printers/printer.ts`  
- [ ] T019 [US1] Add printers and printer_status_history tables to DB schema and migrations in `prisma/schema.prisma` or migrations folder  
- [ ] T020 [P] [US1] Implement printer repository for CRUD and status history in `src/domain/printers/printer.repository.ts`  
- [ ] T021 [US1] Implement printer discovery and registration service (auto + manual) in `src/domain/printers/printer.service.ts`  
- [ ] T022 [US1] Implement printer status poller with backoff and offline detection in `src/domain/printers/printer.poller.ts`  
- [ ] T023 [US1] Expose admin APIs for listing and managing printers in `src/api/admin/printers.routes.ts`  
- [ ] T024 [P] [US1] Add integration tests for printer discovery and normalized statuses in `tests/integration/admin/printers.test.ts`  
- [ ] T025 [US1] Add structured logging and basic metrics around printer polling in `src/domain/printers/printer.poller.ts`  

**Checkpoint**: Admin/API callers can see all LAN printers with current normalized state

---

## Phase 4: User Story 2 – Link Orders to Print Attempts (Priority: P1)

**Goal**: Link Playground.au order items to immutable print attempts with full lifecycle and reprint history

**Independent Test**: Using synthetic order items from Printing-web, connector records multiple attempts per item (success/failure) and exposes complete history via API

### Implementation for User Story 2

- [ ] T026 [US2] Define OrderItemLink and PrintAttempt domain entities in `src/domain/jobs/print-attempt.ts`  
- [ ] T027 [US2] Extend DB schema for order item links and print_attempts tables in migrations folder  
- [ ] T028 [P] [US2] Implement repositories for order item links and print attempts in `src/domain/jobs/print-attempt.repository.ts`  
- [ ] T029 [US2] Implement queue model and print-attempt state machine in `src/domain/jobs/queue.service.ts`  
- [ ] T030 [US2] Implement service for creating new print attempts (including reprints) in `src/domain/jobs/print-attempt.service.ts`  
- [ ] T031 [US2] Wire queue/attempt lifecycle to printer selection and Bambu LAN client in `src/domain/jobs/dispatch.service.ts`  
- [ ] T032 [US2] Add connector API endpoint for Printing-web to submit print jobs for order items in `src/api/integration/jobs.routes.ts`  
- [ ] T033 [US2] Add connector API endpoint for Printing-web to query print-attempt history per order item in `src/api/integration/history.routes.ts`  
- [ ] T034 [P] [US2] Implement audit logging for all print-attempt state changes in `src/domain/jobs/audit-logger.ts`  
- [ ] T035 [P] [US2] Add integration tests for multi-attempt history per order item in `tests/integration/integration/history.test.ts`  

**Checkpoint**: Each order item has a clear, immutable attempt history with states and reasons

---

## Phase 5: User Story 3 – Stock, Cost, and Timelapse Insights (Priority: P2)

**Goal**: Track filament stock, compute restock signals and power usage inputs, and capture timelapses for attempts

**Independent Test**: With simulated usage and timelapse outputs, connector surfaces stock signals, power estimates, and timelapse metadata via APIs

### Implementation for User Story 3

- [ ] T036 [US3] Define filament stock and restock domain entities in `src/domain/stock/stock.ts`  
- [ ] T037 [US3] Extend DB schema for filament_spools, stock_events, and restock_recommendations in migrations folder  
- [ ] T038 [P] [US3] Implement stock repository and aggregation logic in `src/domain/stock/stock.repository.ts`  
- [ ] T039 [US3] Implement material usage tracking on each print attempt in `src/domain/jobs/print-attempt.service.ts`  
- [ ] T040 [US3] Implement restock recommendation engine and low-stock signal generation in `src/domain/stock/stock.service.ts`  
- [ ] T041 [US3] Implement power usage tracking/estimation per attempt in `src/domain/costing/power.service.ts`  
- [ ] T042 [US3] Define TimelapseAsset entity and DB schema in `src/domain/timelapse/timelapse.ts` and migrations folder  
- [ ] T043 [US3] Implement timelapse retrieval from printers into local/object storage in `src/domain/timelapse/timelapse.fetcher.ts`  
- [ ] T044 [US3] Implement YouTube unlisted upload adapter and metadata parsing in `src/adapters/youtube/client.ts`  
- [ ] T045 [US3] Implement timelapse upload job queue and retry behavior in `src/domain/timelapse/timelapse.uploader.ts`  
- [ ] T046 [US3] Implement timelapse visibility policy logic (internal vs customer-facing) in `src/domain/timelapse/timelapse.policy.ts`  
- [ ] T047 [US3] Expose APIs for stock signals, power usage inputs, and timelapse metadata in `src/api/integration/insights.routes.ts`  
- [ ] T048 [P] [US3] Add integration tests for multi-timelapse per order item and visibility rules in `tests/integration/integration/timelapse.test.ts`  

**Checkpoint**: Stock, cost inputs, and timelapses are available to Printing-web via connector APIs

---

## Phase 6: Security, Auth, and Observability Hardening

**Purpose**: Strengthen security posture, admin access, and observability for production use

- [ ] T049 Design and document STRIDE threat model in `docs/security/connector-stride.md`  
- [ ] T050 Implement service-to-service auth middleware for Printing-web→connector calls in `src/auth/serviceAuth.middleware.ts`  
- [ ] T051 Implement admin auth middleware and role checks in `src/auth/adminAuth.middleware.ts`  
- [ ] T052 Add audit log persistence for admin and sync actions in `src/domain/audit/audit.repository.ts`  
- [ ] T053 [P] Add structured log fields (printerId, orderItemId, attemptId, correlationId) across key flows in `src/observability/logger.ts` and callers  
- [ ] T054 [P] Export core metrics (queue depth, attempts per status, timelapse failures, stock-low counts) in `src/observability/metrics.ts`  

---

## Phase 7: API / Sync Integration and Printing-web Contracts

**Purpose**: Finalize and validate contracts and sync behavior with the main platform

- [ ] T055 Define OpenAPI spec for connector integration endpoints in `contracts/connector-openapi.yaml`  
- [ ] T056 Generate or hand-write typed client for connector in Printing-web repo (integration task) in `Printing-web` repository  
- [ ] T057 Implement webhooks/event endpoints for state change notifications in `src/api/integration/webhooks.routes.ts`  
- [ ] T058 [P] Add contract tests ensuring connector API remains compatible with Printing-web expectations in `tests/contract/connector-api.test.ts`  
- [ ] T059 Document sync failure and retry behavior between connector and Printing-web in `docs/sync-behavior.md`  

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and readiness for home-business production use

- [ ] T060 [P] Documentation updates for architecture, APIs, and operations in `docs/architecture.md` and `docs/operations.md`  
- [ ] T061 [P] Code cleanup and refactoring passes across `src/` and `tests/`  
- [ ] T062 [P] Performance tuning for polling and queue processing in `src/domain/printers` and `src/domain/jobs`  
- [ ] T063 [P] Additional unit and integration tests for edge cases in `tests/unit/` and `tests/integration/`  
- [ ] T064 Add operator runbook for printer offline scenarios, backup/restore, and failure handling in `docs/runbook.md`  

---

## Phase 9: Cursor Skills and Developer Workflow

**Purpose**: Ensure /StartApp /StopApp /ResetApp skills work reliably with Docker-only workflows

- [ ] T065 Define behavior and safety constraints for /StartApp, /StopApp, /ResetApp in `docs/cursor-skills.md`  
- [ ] T066 Implement Cursor skill configuration to call Docker compose workflows in `.cursor/skills/connector-skills.json` (or equivalent)  
- [ ] T067 [P] Add automated validation script for skills (start→healthcheck→stop→reset) in `scripts/validate-skills.ps1`  

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – can start immediately  
- **Foundational (Phase 2)**: Depends on Setup completion – BLOCKS all user stories  
- **User Story 1 (Phase 3)**: Depends on Foundational – must be completed before integrating orders  
- **User Story 2 (Phase 4)**: Depends on Phases 2 and 3 – requires printers and queue infrastructure  
- **User Story 3 (Phase 5)**: Depends on Phases 3 and 4 – requires attempts and printers  
- **Security/Observability (Phase 6)**: Depends on core flows of Phases 3–5  
- **API / Sync (Phase 7)**: Depends on domain models and entities from Phases 3–5  
- **Polish (Phase 8)**: Depends on all targeted user stories being complete  
- **Cursor Skills (Phase 9)**: Depends on Docker stack and health endpoints from Phases 1–2  

### Parallel Opportunities

- All tasks marked [P] can be executed in parallel when their dependencies are satisfied (linting/formatting setup, observability, tests, skills validation, etc.).  
- User Story 2 and User Story 3 implementation can be partially parallelized once their shared prerequisites (DB schema, printer model) are in place.  

---

## Implementation Strategy

### MVP First (User Stories 1 and 2)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational  
3. Complete Phase 3: User Story 1 (printer discovery and normalized status)  
4. Complete Phase 4: User Story 2 (print-attempt lifecycle and history)  
5. **STOP and VALIDATE**: End-to-end check from Printing-web job submission to attempt history  

### Phase 2 Delivery

1. Implement Phase 5: User Story 3 (stock, power, timelapses)  
2. Harden with Phase 6: Security and Observability  
3. Finalize contracts and sync in Phase 7  
4. Polish in Phase 8 and validate Cursor skills in Phase 9  

