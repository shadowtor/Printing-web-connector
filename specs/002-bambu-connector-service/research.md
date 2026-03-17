# Research: Playground.au Bambu Lab Connector Service

**Branch**: `002-bambu-connector-service`  
**Date**: 2026-03-17  

## Decisions

- **Runtime & Language**: Node.js LTS with strict TypeScript for type safety and ecosystem alignment with `Printing-web`.  
- **Storage**: Dedicated PostgreSQL database in its own container to avoid coupling and enable independent backup/restore.  
- **Integration Boundary**: REST/JSON API plus optional webhooks between `Printing-web` and connector, modeled after MakerWorks ↔ PrintLab patterns without copying code.  
- **LAN Connectivity**: Bambu LAN Developer Mode as the only supported connectivity approach for MVP; cloud/proxy modes considered separate future features.  

## Rationale

- Using strict TypeScript and Node.js mirrors the `Printing-web` stack and satisfies constitution requirements for type safety and maintainability.  
- A separate Postgres instance matches the constitution’s separation of concerns and allows independent scaling and backup policies.  
- REST/JSON APIs are simple, testable, and compatible with `Printing-web`; webhooks can be added incrementally for lower latency.  
- LAN Developer Mode minimizes reliance on third-party clouds and keeps control within the user’s network, aligning with security-first and non-commercial-use constraints.

## Alternatives Considered

- **Shared database with `Printing-web`**: Rejected due to tight coupling, migration risk, and constitution requirement for clear service boundaries.  
- **Event bus as primary transport**: Deferred to a later phase; adds operational complexity without clear benefit at the initial home-business scale.  
- **Python-based connector** (similar to PrintLab): Rejected for MVP to maintain a uniform TypeScript stack and reuse existing Node.js tooling.  

