<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles
  - Connector Architecture & Integration Constraints
  - Delivery Workflow, Quality Gates & Operational Readiness
  - Governance
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check aligned with connector principles)
  - ⚠ .specify/templates/spec-template.md (add connector-specific security/observability requirements when first feature spec is authored)
  - ⚠ .specify/templates/tasks-template.md (ensure foundational tasks include Docker, security, observability and STRIDE threat-model tasks when generated)
- Follow-up TODOs:
  - None (all placeholders in this constitution are fully defined)
-->

# Playground.au Bambu Lab Connector Constitution

## Core Principles

### I. Docker-First, Reproducible, Production-Grade Service

The Bambu Lab connector for Playground.au MUST be delivered as a **Docker-first,
containerized service** for local development, testing, staging, and production.
All environments MUST be reproducible from version-controlled configuration
(`Dockerfile`, `docker-compose`/equivalent, and infra manifests). No "works on
my machine" setups are permitted. The connector MUST remain a separate service
from the main commerce platform, with a clean, well-documented integration
surface.

Rationale: Reproducible containers and consistent Docker workflows are required
to safely run this connector in production, ease onboarding, and ensure that
security, performance, and observability guarantees hold across environments.

### II. Clear Service Boundaries & Integration Contracts

The connector MUST maintain a **hard service boundary** between:
- The Playground.au commerce platform (core storefront, payments, order
  management, user accounts).
- The Bambu Lab connector service (printer connectivity, job orchestration,
  status sync, and printer-specific concerns).

Integration MUST occur only via explicit, versioned contracts (e.g. HTTP/REST,
gRPC, message queues, or documented file-based/queue-based interfaces) that are
documented and testable. The connector MUST support **multiple Bambu Lab
printers** as first-class entities, with all APIs and data models designed to
handle more than one printer instance from the outset.

Rationale: Clean separation protects the storefront from printer-specific
risks, allows independent deployment and scaling, and makes it possible to
swap, extend or decommission the connector without rewiring the commerce
platform.

### III. Security-First, Zero-Trust & Compliance with Non-Commercial Licensing

The architecture, implementation, and operations of the connector MUST adopt a
**security-first, zero-trust** posture:
- Assume all networks are hostile by default.
- Treat the main Playground.au platform and the connector as mutually
  untrusted peers communicating over authenticated and authorization-checked
  interfaces.
- No hardcoded secrets are allowed; all secrets MUST originate from
  environment variables or a supported secret manager and be documented.
- Where protocols and devices permit, communication MUST be encrypted in
  transit (TLS, SSH, VPN, or equivalent). Where Bambu Lab LAN Developer Mode
  does not support full TLS, the design MUST explicitly document the residual
  risk and any compensating controls.
- The connector MUST explicitly target **LAN-only Bambu Lab Developer Mode**
  connectivity as its primary operational mode. Any future remote or
  cloud-mediated connectivity MUST be treated as a separate feature with its
  own threat model and governance review.
- Documentation for this project MUST include a **clear non-commercial-use
  notice** aligned with the platform owner's licensing rules, and must
  highlight that all generated code and implementation work in this project is
  **accredited to shadowtor**.

Rationale: Printer connectors have direct access to physical hardware and user
data; compromising them can lead to financial loss, physical damage, or data
breaches. Zero-trust and explicit non-commercial licensing constraints are
non‑negotiable.

### IV. Strict Type Safety, Validation, and Explicit Error Handling

Implementation MUST use **strict typing** and **explicit input/output
validation** at all service boundaries:
- Prefer languages and frameworks with strong static type systems or strict
  runtime validation (e.g. TypeScript with `strict` mode, runtime schema
  validators for JSON payloads).
- Every external input (HTTP request, queue message, config, environment
  variable, printer status payload) MUST be validated before use.
- Error handling MUST be explicit, with domain-specific error types where
  appropriate, clear logging, and user/admin-facing error messages that do not
  leak sensitive information.
- Maintainability, readability, and clarity MUST take precedence over clever or
  overly compact code. "Magic" abstractions that obscure control flow or error
  paths are discouraged unless they come from well-understood, well-documented
  libraries.

Rationale: Strict types and validation reduce runtime surprises, and explicit
error handling makes failures observable, debuggable, and safe.

### V. Observability, Auditability, and Operational Readiness

The connector MUST be designed for **observability and auditability** from the
start:
- Structured logging, metrics, and health endpoints are mandatory.
- The system MUST provide **health checks** suitable for container orchestrator
  liveness/readiness probes.
- Actions taken by admins and system operators, printer actions, sync events,
  and print-attempt history MUST be auditable through logs and/or dedicated
  audit records (subject to privacy requirements).
- Backup and restore considerations MUST be explicitly documented and
  implemented where state is stored (e.g. print queue, printer configurations,
  historical job records).
- Only the **latest stable dependencies** are allowed; dependencies MUST be
  pinned to reproducible versions and periodically reviewed for security
  updates.

Rationale: Production services require clear visibility for operators and a
defensible audit trail when something goes wrong.

## Connector Architecture & Integration Constraints

This section describes additional constraints, security requirements, and
integration standards for the Playground.au Bambu Lab connector.

1. **Connector as a Separate Bounded Context**
   - The connector service encapsulates all Bambu Lab–specific logic, device
     models, queues, and status synchronization.
   - The Playground.au core platform remains responsible for orders, user
     accounts, pricing, and storefront behavior.
   - Data ownership MUST be explicit:
     - Playground.au owns: orders, customers, pricing, product catalog,
       storefront content.
     - Connector owns: printer configuration, printer capabilities, print job
       translation, printer status snapshots, printer-specific telemetry
       necessary for job lifecycle.
     - Shared data structures MUST be defined via explicit contracts (e.g.
       OpenAPI schemas, protobuf, JSON schemas) and versioned.

2. **LAN-Only Bambu Lab Developer Mode as Primary Target**
   - Primary connectivity mode is via Bambu Lab LAN Developer Mode running on
     the local network.
   - The service MUST document network assumptions (subnets, discovery, ports,
     authentication tokens) and any residual risks.
   - External connectivity or cloud relays (if ever introduced) MUST be modeled
     as separate, opt-in features with additional STRIDE analysis.

3. **Reference Architectures (Review, Do Not Blindly Copy)**
   - Before introducing or changing major architectural patterns, the assistant
     and contributors MUST **review** the architecture and patterns used in the
     following repositories, taking them as inspiration and cautionary
     examples, **not** as copy-paste sources:
     - `https://github.com/shadowtor/Printing-web`
     - `https://github.com/maziggy/bambuddy`
     - `https://github.com/schartrand77/mkw2`
     - `https://github.com/schartrand77/PrintLab`
   - Any code, configuration, or design ideas derived from these references
     MUST be:
     - Adapted to this project's constraints and security posture.
     - Documented in design notes (e.g. "inspired by X, modified for Y").
     - Verified against licensing and non-commercial-use rules.

4. **Containerization & Environments**
   - The canonical way to run the connector is inside a container built from
     the repository’s `Dockerfile`.
   - Local development, CI, and production deployments MUST use images built
     from the same Docker context with environment-specific configuration
     provided via environment variables or secrets.
   - No direct reliance on developer host tools beyond Docker, Docker Compose
     (or equivalent), and minimal prerequisites documented in the README.

5. **Secure Defaults**
   - All configuration defaults MUST be secure:
     - Dangerous features (e.g. unauthenticated endpoints, debug flags,
       remote admin consoles) MUST be opt‑in and disabled by default.
     - Minimal privileges for any external integrations (least privilege).
   - Any deviation from secure defaults MUST be documented with justification
     and mitigation steps.

## Delivery Workflow, Quality Gates & Operational Readiness

This section defines how work on the connector MUST be specified, implemented,
and validated.

1. **STRIDE Threat Modeling Before Implementation**
   - Every significant feature, integration, or architectural change MUST be
     preceded by a **STRIDE-style threat model**:
     - Identify threats across Spoofing, Tampering, Repudiation, Information
       disclosure, Denial of service, and Elevation of privilege.
     - Capture the model in version-controlled documentation (e.g.
       `docs/security/<feature>-stride.md` or in the relevant spec/plan).
   - Implementation MUST reference the threat model and document which
     mitigations were implemented, accepted, or deferred.

2. **Secure Defaults, Observability & Health Checks**
   - Each feature’s plan/spec MUST explicitly describe:
     - How secure defaults are enforced.
     - Which logs, metrics, and traces are produced.
     - What health endpoints and self-checks are needed for monitoring and
       orchestration.
   - A feature is not "done" until:
     - Health checks exist and are wired into the container runtime.
     - Logs contain enough context to debug printer and sync issues without
       exposing secrets.

3. **Backup & Restore Considerations**
   - For any state the connector persists (configurations, queues, history),
     the design MUST answer:
     - What needs to be backed up?
     - How is it restored?
     - What is the acceptable Recovery Point Objective (RPO) and Recovery Time
       Objective (RTO)?
   - Where applicable, backup/restore procedures MUST be testable in a
     non-production environment using the same container images and tooling.

4. **Future Expansion Without Tight Coupling**
   - The connector MUST remain independently deployable and testable.
   - No direct imports of storefront/backend code are allowed; all interaction
     goes through well-defined interfaces.
   - The architecture MUST permit:
     - Introducing additional printer vendors.
     - Scaling the connector separately from the storefront.
     - Replacing the connector implementation while preserving contracts.

5. **Cursor Skills for Container Lifecycle**
   - Before the project can be considered **ready**, Cursor skills/commands
     `/StartApp`, `/StopApp`, and `/ResetApp` MUST be:
     - Created and wired to start, stop, and reset the Dockerized connector
       service (including dependencies like supporting databases or queues).
     - Documented in the repository (usage, expected behavior, prerequisites).
     - Validated in CI or scripted checks to prove they work against the
       canonical Docker workflows.
   - Any future change that breaks these skills MUST be treated as a
     production-impacting regression and blocked until fixed.

6. **Code Ownership, Licensing, and Attribution**
   - All generated code and implementation work in this project MUST be
     explicitly attributed to **shadowtor** as the owner in documentation and
     licensing files.
   - Documentation MUST reiterate the **non-commercial-use** nature of the
     platform and connector, in alignment with Playground.au and the
     Printing-web platform licensing.

## Governance

This constitution governs all work performed in the
`Printing-web-connector` project for the Playground.au Bambu Lab connector.

1. **Supremacy of the Constitution**
   - This constitution supersedes ad-hoc practices, historical patterns, and
     external examples when conflicts arise.
   - References to other repositories or communities are advisory only and do
     not override these rules.

2. **Compliance in Specifications, Plans, and Tasks**
   - Feature specs (`/speckit.specify` outputs), implementation plans
     (`/speckit.plan`), and tasks (`/speckit.tasks`) MUST each include an
     explicit **Constitution Check** section ensuring:
     - Docker-first, reproducible environment is preserved.
     - Service boundaries and contracts remain clean and versioned.
     - STRIDE threat modeling has been performed and documented.
     - Secure defaults, observability, and audits are covered.
     - LAN-only Bambu Lab Developer Mode assumptions are preserved or
       explicitly revisited with new threat modeling.
     - Non-commercial-use and attribution to shadowtor are respected.
   - Code review and automated checks SHOULD enforce these gates wherever
     practical (e.g. CI checks for Docker builds, linting, security scans).

3. **Versioning & Amendment Procedure**
   - This constitution follows **semantic versioning**:
     - **MAJOR**: Backward-incompatible governance changes, removal or
       redefinition of core principles.
     - **MINOR**: New principles or sections, or material expansion of existing
       guidance.
     - **PATCH**: Clarifications, minor rewording, typo fixes that do not
       materially alter expectations.
   - Amendments MUST:
     - Be proposed in a pull request that updates this file.
     - Include a short rationale and expected impact.
     - Run a repository-wide review to check plan/spec/tasks templates and
       runtime documentation for alignment.
   - The **Sync Impact Report** comment at the top of this file MUST be kept up
     to date with each version change.

4. **Review Expectations**

   - Every substantive PR MUST be reviewed for:
     - Compliance with the core principles in this constitution.
     - Security impact, including any changes to network exposure, secrets, or
       printer control flows.
     - Observability and auditability impact.
   - For high-risk changes (e.g. new connectivity modes, new printer
     operations, new data stores), an updated STRIDE threat model is
     mandatory before merge.

5. **Non-Compliance Handling**
   - If implementation, configuration, or docs violate this constitution:
     - The violation MUST be documented in the plan/spec with justification.
     - A follow-up task MUST be created to remediate or formally accept the
       deviation in a future amendment.
   - Persistent or unaddressed violations SHOULD trigger a governance review
     and potential MAJOR version amendment to either re-align the project or
     explicitly change the rules.

**Version**: 1.0.0 | **Ratified**: 2026-03-17 | **Last Amended**: 2026-03-17

