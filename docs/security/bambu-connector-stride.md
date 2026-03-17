# STRIDE Threat Model: Bambu Connector

## Scope
- Connector API endpoints (`/api/integration/*`, `/api/admin/*`)
- LAN printer connectivity adapter
- Connector database and audit logs
- Timelapse upload path (YouTube)

## Auth and unauthenticated endpoints
- Only `/health/live` and `/health/ready` are unauthenticated (for orchestrators and load balancers). `/metrics` is unauthenticated unless `METRICS_AUTH_SECRET` is set; when set, clients must send `Authorization: Bearer <secret>`.
- All other routes require authentication: integration routes use `x-service-auth` (service shared secret), admin routes use `x-admin-auth` (admin secret). Restrict health and metrics to trusted networks in production (e.g. only from the mesh or monitoring).

## Threats and Mitigations

### Spoofing
- Threat: Unauthorized service or admin callers impersonate trusted actors.
- Mitigation: `x-service-auth` shared secret for integration routes, `x-admin-auth` for admin routes, rotation via env secrets.

### Tampering
- Threat: Job payloads or status updates altered in transit.
- Mitigation: Service auth required on all integration endpoints, input schema validation with Zod.

### Repudiation
- Threat: Operators deny having changed printer/job state.
- Mitigation: Audit event records stored in DB with actor/event metadata.

### Information Disclosure
- Threat: Secrets or sensitive order/attempt data leaked in logs or APIs.
- Mitigation: Redacted config logging, no secret values logged, strict route-level auth.

### Denial of Service
- Threat: Flooding integration endpoints or unstable printer networks causing degraded service.
- Mitigation: Queue abstraction, periodic polling with controlled interval and retries/backoff strategy.

### Elevation of Privilege
- Threat: Integration clients access admin-only capabilities.
- Mitigation: Separate middleware for admin and service routes, no implicit trust between route groups.

### Secure communications
- **Inbound**: Production deployment via Cloudflare Tunnel (cloudflared) provides HTTPS at the edge; the connector listens on HTTP internally. See the runbook "Production with Cloudflare Tunnel" section and linked Cloudflare docs.
- **Outbound**: When the connector calls Printing-web (`PRINTING_WEB_BASE_URL`), use `https://` in production when available. Service and admin auth (shared secrets) protect request integrity and authenticity.
