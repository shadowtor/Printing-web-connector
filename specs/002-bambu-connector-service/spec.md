# Feature Specification: Playground.au Bambu Lab Connector Service

**Feature Branch**: `001-bambu-connector-service`  
**Created**: 2026-03-17  
**Status**: Draft  
**Input**: User description: "Create a detailed product specification for a separate Bambu Lab connector service for Plaground.au."

---

## Problem Statement

Playground.au currently provides a 3D printing commerce platform (storefront, quoting, checkout, order management, production queues) but has no dedicated, production-grade bridge between its order/production domain and Bambu Lab printers running in LAN-only Developer Mode. Operators must manually track which printer produced which order item, which attempts failed, how much filament and power were consumed, and when materials need restocking. There is also no unified way to attach and surface timelapses for customers vs internal staff.  

A separate Bambu Lab connector service is needed to provide a secure, Docker-only, LAN-first service that discovers printers, manages a printer-agnostic execution queue, tracks print attempts and consumables, and feeds normalized execution and stock signals back into Playground.au without tightly coupling commerce logic to printer communication.

---

## Target Users

- **Storefront operators / admins**: People responsible for running the printers, monitoring the queue, managing filament stock, and ensuring orders are produced correctly and on time.
- **Home-business owners**: Small-shop owners who rely on Playground.au for storefront + back office, and need reliable, auditable production tracking and cost inputs.
- **Platform developers / maintainers**: Engineers working on `Printing-web` who need a clean, versioned integration boundary to a printer execution service without importing printer-specific logic into the core app.
- **End customers (indirect)**: Customers who may see selected timelapses and high-level production state in their order views, but are not direct users of the connector.

---

## Core Features

1. **LAN-only Bambu Developer Mode connectivity** to one or more printers on the local network.
2. **Printer discovery, registration, and management** with metadata (name, model, serial/identifier, AMS presence, nozzle/dual-nozzle data where available, firmware metadata where available).
3. **Normalized printer state model** exposed to Playground.au: `idle`, `queued`, `printing`, `paused`, `error`, `completed`, `offline`.
4. **Queue and print-job management** that links Playground.au orders and order items to concrete print attempts on specific printers.
5. **Immutable print-attempt history**: each order item may have 0..N attempts (including reprints and failures), with none overwritten.
6. **Per-attempt metadata**: attempt number, timestamps, printer used, status transitions, reason for failure or reprint, operator notes, material usage, power usage or estimated power usage.
7. **Filament and stock tracking**: loaded filament, AMS slot mapping where available, estimated remaining filament, thresholds, and restock recommendations.
8. **Stock and demand signals back to Playground.au**: low-stock warnings and “purchase/attention needed” feeds to admin UX.
9. **Power usage tracking/estimation and cost inputs** sent back for reporting and future quote refinement.
10. **Timelapse retrieval** for completed prints where available from Bambu printers.
11. **YouTube unlisted upload workflow** and return of URLs/metadata to Playground.au.
12. **Multi-timelapse support per order item** (for reprints and failures).
13. **Timelapse visibility policies** so internal staff can see all attempts while customer-facing views see only successful or explicitly approved attempts.
14. **Management/monitoring APIs** for printer fleet visibility, queue state, material/stock state, power usage, and sync health.
15. **Secure admin access and service authentication** between Playground.au and the connector.

---

## Non-Goals

- Re-implementing or replacing the **Printing-web** storefront, quoting, checkout, or order management flows.
- Supporting non-Bambu printers in the initial release (future extension is allowed but out of MVP scope).
- Making Bambu **cloud mode** the primary connectivity method; cloud usage, if added later, will be a separate, opt-in feature with its own threat model.
- Implementing complex dynamic pricing or quoting algorithms inside the connector; the connector only provides cost inputs to Playground.au.
- Providing a full standalone print farm UI unrelated to Playground.au; the connector is a backend service with limited admin-facing surfaces.

---

## Constraints

- The connector MUST be a **separate service/container** from the main Playground.au platform.
- It MUST be possible for the main platform to continue functioning (browsing catalog, quoting, ordering, basic order management) even if the connector is unavailable; printer-related features must degrade gracefully.
- The connector MUST NOT tightly couple commerce logic (pricing, order lifecycle) to printer communication logic; all interaction goes through versioned APIs/events.
- **LAN-only Bambu Developer Mode** connectivity is the primary target. Bambu cloud or remote proxying is not assumed or required for MVP.
- The service MUST be **Docker-only** for supported environments; local/test/prod use container images and env vars/secret managers.
- Runtime and dependencies MUST be on the **latest stable** versions, pinned to reproducible versions.
- The connector MUST be suitable for a **home business** but engineered to **production standards** (security, observability, backup/restore, type safety).

---

## External Integrations

- **Printing-web (primary integration)**  
  - Source of orders, order items, and user/admin context.  
  - Consumer of printer states, queue status, stock/demand signals, power/cost inputs, and timelapse URLs/metadata.  
  - Integration via:
    - REST/JSON APIs exposed by the connector.
    - Optional connector→Printing-web webhooks for state changes (attempt completed/failed, stock low, timelapse ready).
- **Bambu Lab printers (LAN-only Developer Mode)**  
  - Source of printer telemetry, job state, filament state where exposed, and timelapse assets.  
  - Integration via LAN Developer Mode APIs/MQTT as documented by Bambu and explored in reference repos.
- **YouTube (timelapse hosting)**  
  - Target for unlisted timelapse uploads.  
  - Integration via YouTube Data API with an operator-controlled YouTube account.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Connect and manage Bambu Lab printers (Priority: P1)

Storefront admins/operators can discover Bambu Lab printers on the LAN, register them with friendly names and metadata, and see their current normalized status to determine whether they are available and healthy for jobs.

**Why this priority**: Without reliable multi-printer visibility, no downstream queueing, stock, or timelapse workflows can function.

**Independent Test**: In a dev/test environment with 1–3 LAN Bambu printers, the connector discovers or accepts manual entries, normalizes their state, and exposes an API that returns consistent, up-to-date status and metadata without involving actual orders.

**Acceptance Scenarios**:

1. **Given** one or more Bambu Lab printers in LAN Developer Mode, **When** the connector runs its discovery/registration routine, **Then** each printer is either auto-discovered or can be manually registered with name, model, serial/identifier, AMS presence, nozzle data (if available), and firmware metadata (if available).
2. **Given** a registered printer, **When** its actual state changes (e.g. idle → printing → completed or online → offline), **Then** the connector exposes a normalized state (`idle`, `queued`, `printing`, `paused`, `error`, `completed`, `offline`) via API within an acceptable delay.

---

### User Story 2 – Link orders and order items to print attempts (Priority: P1)

Operators can see exactly how each Playground.au order item was produced across multiple attempts, including failures, reprints, and per-attempt metadata.

**Why this priority**: This is the core value of the connector—making physical execution traceable and auditable against orders.

**Independent Test**: Using synthetic order items, the connector records multiple print attempts (success, failure, reprints) for a single item and exposes a chronological history via API without overwriting older attempts.

**Acceptance Scenarios**:

1. **Given** an order item marked ready for production in Printing-web, **When** the main platform submits a job to the connector, **Then** the connector creates a print attempt linked to that order item and a chosen printer, assigns an attempt number, and tracks timestamps and status transitions.
2. **Given** an order item with multiple failed attempts followed by a successful reprint, **When** an admin requests its history from the connector, **Then** the connector returns all attempts with attempt numbers, statuses, reasons for failure/reprint, notes, material usage, and power usage/estimates.

---

### User Story 3 – See stock, cost inputs, and timelapses for production (Priority: P2)

Operators can view filament stock status, restock recommendations, estimated power usage/cost inputs, and timelapse links for each print attempt, while customers only see curated, successful timelapses.

**Why this priority**: Supports sustainable production, better pricing, and a richer customer-facing experience.

**Independent Test**: With simulated print attempts and filament usage, the connector updates filament stock estimates, emits low-stock signals, calculates power usage estimates, retrieves and uploads timelapses, and exposes appropriate views/APIs for both admins and customer-facing surfaces.

**Acceptance Scenarios**:

1. **Given** printers with configured AMS/filament states and stock thresholds, **When** print attempts consume filament, **Then** the connector updates estimated remaining filament per material and per printer/slot and surfaces low-stock & restock recommendations to Printing-web.
2. **Given** completed attempts with available Bambu timelapses and configured YouTube credentials, **When** timelapses are processed, **Then** the connector uploads them as unlisted videos, stores URLs/metadata, and enforces visibility policies (all attempts visible internally, only approved/successful attempts visible to customers).

---

### Edge Cases

- Printers become **temporarily unreachable** on the LAN (power off, Wi‑Fi down) after being registered.
- Jobs are interrupted mid-print (filament runout, jam, power loss) and must be retried while preserving partial data.
- Timelapse retrieval or YouTube upload fails partially (network timeout, quota exceeded).
- Printing-web is temporarily unreachable when the connector needs to push webhook events or stock signals.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect to one or more Bambu Lab printers on the local network using LAN-only Developer Mode and maintain per-printer connectivity state.
- **FR-002**: System MUST discover or allow manual registration of printers and store metadata including printer name, model, serial/identifier, AMS presence, nozzle data where available, and firmware metadata where available.
- **FR-003**: System MUST expose a normalized printer state model with at least: `idle`, `queued`, `printing`, `paused`, `error`, `completed`, `offline`.
- **FR-004**: System MUST provide a queue and print-job management layer so orders and order items from the main platform can be linked to concrete print attempts on physical printers.
- **FR-005**: System MUST represent each order item’s physical production as 0..N immutable print attempts rather than overwriting a single record.
- **FR-006**: System MUST store per-attempt metadata including attempt number, timestamps (created, started, completed), printer used, status history, reason for failure or reprint, operator notes, material usage, and power usage or estimated power usage.
- **FR-007**: System MUST track filament and stock information, including loaded filament, AMS slot mapping where available, estimated remaining filament, configured stock thresholds, and restock recommendations.
- **FR-008**: System MUST feed stock and material demand signals back to the main platform via APIs and/or events so low-stock warnings and purchase needs can be surfaced in admin interfaces.
- **FR-009**: System MUST compute or record power usage metrics per attempt and expose them to the main platform as cost inputs for reporting and future quote refinement.
- **FR-010**: System MUST retrieve timelapses for completed print attempts where the printer exposes them, and associate them with the correct print attempt records.
- **FR-011**: System MUST upload timelapses as unlisted YouTube videos (when enabled), capture resulting URLs/metadata, and send them to the main platform linked to print attempts and order items.
- **FR-012**: System MUST support multiple timelapses per order item (e.g. for reprints or failed attempts) and maintain correct associations and ordering.
- **FR-013**: System MUST enforce timelapse visibility policies so internal users can see all timelapses while customer-facing views are limited to successful or explicitly approved attempts.
- **FR-014**: System MUST provide management and monitoring APIs (and optionally simple views) for printer fleet visibility, queue state, material/stock state, power usage, and sync health.
- **FR-015**: System MUST provide secure admin access and service-to-service authentication for all sensitive endpoints and operations.
- **FR-016**: System MUST operate as a separate service/container from the main Playground.au platform, and the main platform MUST continue to function for core commerce flows if the connector is down.
- **FR-017**: System MUST be designed to scale to multiple printers and multiple concurrent queued jobs without requiring changes to core commerce data models in the main platform.
- **FR-018**: System MUST not depend on Bambu cloud mode as the primary design target; cloud/reverse-proxy connectivity, if present, is optional and secondary.

### Key Entities *(include if feature involves data)*

- **Printer**: Represents a Bambu Lab printer accessible over LAN Developer Mode, including metadata (name, model, serial, AMS, capabilities) and current normalized state.
- **Order Item Link**: Represents the association between a Playground.au order item and one or more print attempts within the connector.
- **Print Attempt**: Represents a single physical attempt to produce an order item. Contains attempt number, timestamps, status history, failure/reprint reasons, material usage, and power usage/estimate.
- **Filament Stock / Spool**: Represents filament and material inventory including AMS slot mapping where available, current estimates of remaining material, thresholds, and restock recommendations.
- **Timelapse Asset**: Represents a timelapse recording associated with a specific print attempt, including raw-source metadata (if stored), YouTube URL and details, and visibility flags.
- **Sync & Audit Event**: Represents auditable events such as admin actions, printer state changes, sync attempts to/from Printing-web, timelapse uploads, and configuration changes.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operators can see accurate, normalized states for all configured Bambu printers within an acceptable latency window (e.g. \<30 seconds under typical conditions).
- **SC-002**: For any order item processed by the connector, operators can retrieve a full history of all print attempts (including failures and reprints) in one view/API call with no missing or overwritten data.
- **SC-003**: Filament stock signals from the connector enable the main platform to show at least one accurate low-stock or restock-needed indicator for key materials in an admin dashboard.
- **SC-004**: When the connector is intentionally stopped, the main Playground.au platform can still complete browsing, quoting, and order placement flows, and clearly indicates that production status is temporarily unavailable.
- **SC-005**: For at least a configured subset of successful print attempts, timelapses are uploaded and available as unlisted YouTube links, with internal users seeing all timelapses and customer views limited to compliant/approved attempts.
- **SC-006**: The connector can manage at least several printers (e.g. 3–5) with a realistic home-business order volume without data corruption, unbounded queue growth, or intolerable latency in status or stock updates.

---

## Failure and Retry Handling

- Printer connectivity failures MUST be detected and surfaced via normalized states (e.g. `offline`), with retry/backoff behavior per printer to avoid hammering the network.
- Sync failures when pushing data to Printing-web (e.g. webhooks, stock signals) MUST be logged, retried with backoff, and reflected in a sync health indicator.
- Timelapse retrieval and YouTube upload MUST use bounded retries and MUST NOT block the core print lifecycle; attempts should complete even if media processing fails, with clear admin-facing failure reasons.
- Jobs that fail mid-print MUST result in a failed attempt with reason, and operators MUST be able to initiate new attempts without losing prior history.

---

## Security Requirements

- The connector MUST follow a **security-first, zero-trust** model with:
  - Strong service-to-service auth between Printing-web and the connector.
  - Authenticated and authorized admin endpoints.
  - No hardcoded secrets; all secrets supplied via env vars or secret manager.
- All cross-service traffic SHOULD be encrypted in transit where possible (TLS termination in front of HTTP APIs, VPN for remote access if ever introduced).
- Access to detailed production and timelapse data MUST be permission-gated and respect non-commercial-use and licensing constraints.

---

## Observability Requirements

- The connector MUST provide:
  - Health endpoints suitable for container orchestrator liveness/readiness probes.
  - Structured, contextual logs for printer, queue, stock, sync, and timelapse flows.
  - Metrics for key signals: printer availability, queue depth, attempts per status, sync error counts, timelapse upload failures, and low-stock events.
- Logs MUST avoid secrets and PII, while being rich enough to reconstruct operational timelines.

---

## Admin Workflows

- Admins should be able to:
  - Register/edit printers and view their status.
  - View and manage the print queue and per-order-item attempt history.
  - Inspect filament stock, low-stock warnings, and restock recommendations.
  - See power-usage and cost-input summaries per attempt or per period.
  - Review timelapse assets and configure/override visibility policies.
  - Inspect sync health and recent failures between connector and Printing-web.

---

## Data Synchronization Responsibilities

- **Connector**:
  - Owns and maintains printer, attempt, stock, and timelapse data.
  - Pushes or exposes normalized execution and stock signals to Printing-web.
- **Printing-web**:
  - Owns orders, customers, pricing logic, and primary UX.
  - Calls connector APIs and subscribes to connector events/webhooks to show execution and stock state.

---

## API / Event Boundary Expectations

- Interactions between Printing-web and the connector SHOULD be via **stable, versioned HTTP APIs** and optionally webhooks; no shared DBs or in-process coupling.
- The connector MUST NOT assume internal schema details of Printing-web beyond IDs and explicitly agreed contracts; conversely, Printing-web MUST treat connector responses as external contracts.

---

## Docker-Only Execution Requirements

- The connector MUST be built, tested, and deployed exclusively via container images (Docker).
- Local/test/prod usage MUST rely only on Docker (and Docker Compose or equivalent) plus environment configuration, with no additional host-only tools required for normal operation.

---

## Reference Repositories and Adaptation Instructions

The assistant and contributors MUST review, but not copy verbatim from, the following repositories:

- **Primary integration target**:
  - `https://github.com/shadowtor/Printing-web`
- **Reference inspirations**:
  - `https://github.com/maziggy/bambuddy`
  - `https://github.com/schartrand77/mkw2`
  - `https://github.com/schartrand77/PrintLab`

The assistant MUST analyze these repositories for:

- Printer connection approaches (especially LAN Developer Mode and MQTT/REST patterns).
- Dashboard and management patterns for multi-printer visibility.
- Queue and order/job lifecycle modeling patterns.
- Inventory/spool/stock modeling ideas.
- Security patterns (auth, roles, API keys, CSRF, etc.).
- Docker architecture and environment management patterns.
- API structure and integration boundaries between core platform and execution service.

The assistant MUST then adapt useful concepts into this project **without blindly copying** code. All adaptations must respect the Playground.au constitution, this specification, and the platform’s non-commercial-use and attribution rules.