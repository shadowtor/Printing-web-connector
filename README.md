# Printing-web-connector

Bambu Lab connector service for the Playground.au Printing-web platform.

## Overview

This project provides a separate, Docker-first connector service that integrates with:

- https://github.com/shadowtor/Printing-web

Core responsibilities:

- LAN-mode Bambu printer discovery and normalized state tracking
- Order item to print-attempt lifecycle tracking (immutable history)
- Filament stock and power estimate insights
- Timelapse association and optional YouTube upload
- Secure service-to-service integration APIs for Printing-web

## Quick Start

1. Copy env:
   - `cp .env.example .env`
2. Install deps:
   - `npm ci`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Start service:
   - `npm run dev`

Or run Docker stack: **production** `docker compose up --build -d` (set `DATABASE_URL`); **local testing** `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d`.

## Commands

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Documentation

- `docs/architecture.md`
- `docs/integration.md`
- `docs/security/bambu-connector-stride.md`
- `docs/sync-behavior.md`
- `docs/testing-strategy.md`
- `docs/runbook.md`
- `docs/cursor-skills.md`

## Attribution and Licensing

All generated code and implementation work in this project is accredited to **shadowtor**.
This project follows the platform owner's non-commercial-use expectations.
