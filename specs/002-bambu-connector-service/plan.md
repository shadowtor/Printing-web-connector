# Implementation Plan: Playground.au Bambu Lab Connector Service

**Branch**: `002-bambu-connector-service` | **Date**: 2026-03-17 | **Spec**: `/specs/002-bambu-connector-service/spec.md`  
**Input**: Feature specification from `/specs/002-bambu-connector-service/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a **separate, Dockerized TypeScript service** that:

- Connects to one or more Bambu Lab printers over **LAN-only Developer Mode**.  
- Owns a **connector-local queue and immutable print-attempt history** for Playground.au order items.  
- Tracks **filament stock, power usage estimates, and timelapses**, and surfaces them to the main platform.  
- Exposes a **stable HTTP API + optional webhooks** to `Printing-web`, aligned with its existing architecture.  
- Satisfies the Playground.au constitution for strict type safety, security, observability, backup/restore, and Cursor skill integration.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js LTS (latest stable) with strict TypeScript (`"strict": true`).  
**Primary Dependencies**: Fastify (HTTP server), PostgreSQL client & migration tool (Prisma or Kysely + migrations), MQTT/HTTP client for Bambu LAN Developer Mode, structured logger, metrics library.  
**Storage**: Dedicated PostgreSQL database in a **separate Postgres container** (no shared DB with `Printing-web`).  
**Testing**: Jest/Vitest for unit and integration tests, plus contract tests for the connector API.  
**Target Platform**: Docker-only deployment across local, test, and production, orchestrated via Docker Compose or equivalent.  
**Project Type**: Headless web-service with HTTP API + optional webhooks; limited admin UI only.  
**Performance Goals**:  
- Printer state freshness: typically \< 30s from real-world change to normalized state.  
- Queue/attempt processing able to handle several printers (3–5) and tens of concurrent queued jobs without backlog growth or noticeable latency.  
**Constraints**:  
- No host-only dependencies (all infra runs in containers).  
- No Bambu cloud dependency as primary mode; LAN Developer Mode is mandatory target.  
- Must be production-grade for home-business needs (security, audit, backup/restore, observability).  
**Scale/Scope**: Initially 1–5 printers and low hundreds of attempts per week; architecture leaves room to add workers/containers later without changing external contracts.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This plan complies with the Playground.au Bambu Lab Connector Constitution:

- **Docker-first, reproducible containerization**: All runtime (connector + Postgres) is defined via Dockerfile and Compose; documentation mandates Docker for all environments.  
- **Separate service boundaries**: Connector is a standalone service with its own DB and HTTP API; `Printing-web` interacts only through versioned contracts.  
- **STRIDE-style threat model**: Plan includes a dedicated STRIDE document (`docs/security/bambu-connector-stride.md`) as a prerequisite for implementation.  
- **Secure defaults**: No unauthenticated external endpoints; secrets only via env/secret manager; conservative defaults for timeouts and retries.  
- **Observability and health checks**: Health endpoints, structured logging, and metrics are part of the foundational phase.  
- **Auditability**: Printer actions, admin actions, sync events, and print-attempt history are logged to dedicated audit tables.  
- **Data ownership and sync boundaries**: Orders/customers remain in `Printing-web`; printers/attempts/stock/timelapses in connector; clear mapping entities and APIs.  
- **Multi-printer support**: Printer model and polling are multi-printer by design; scaling to multiple concurrent jobs is an explicit requirement.  
- **Latest stable dependencies**: Plan calls for latest LTS runtime and stable, pinned library versions.  
- **Documentation clarity & non-commercial-use notice**: Architecture and usage docs will carry non-commercial and attribution clauses consistent with `Printing-web`.  
- **Attribution to shadowtor**: Connector docs and license text will credit shadowtor as owner of generated code/implementation.  
- **Backup/restore considerations**: Backup and restore strategy for the connector DB is defined as a required operational asset.  
- **Future expansion without tight coupling**: API contracts are stable; internals can evolve (e.g., more printer vendors or queue backends) without changing `Printing-web`.  
- **Cursor skills `/StartApp`, `/StopApp`, `/ResetApp`**: Plan includes a phase to define, implement, and validate these skills for Docker workflows before declaring the project “ready.”

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
