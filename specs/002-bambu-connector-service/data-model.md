# Data Model: Playground.au Bambu Lab Connector Service

**Branch**: `002-bambu-connector-service`  
**Date**: 2026-03-17  

## Entities

### Printer
- Represents a Bambu Lab printer reachable via LAN Developer Mode.
- Key attributes:
  - `id`
  - `name`
  - `model`
  - `serial`
  - `ams_present` (boolean)
  - `nozzle_config` (where available)
  - `firmware_version` (where available)
  - `normalized_state` (`idle | queued | printing | paused | error | completed | offline`)

### OrderItemLink
- Associates a Playground.au order item with connector-managed print attempts.
- Key attributes:
  - `id`
  - `printing_web_order_item_id`
  - `current_status`

### PrintAttempt
- Immutable record of a single attempt to produce an order item on a specific printer.
- Key attributes:
  - `id`
  - `order_item_link_id`
  - `printer_id`
  - `attempt_number`
  - `status` (state machine)
  - `reason` (for failure/reprint)
  - `created_at`, `started_at`, `completed_at`
  - `material_usage`
  - `power_usage_estimate`
  - `notes`

### FilamentStock / Spool
- Represents filament/material inventory.
- Key attributes:
  - `id`
  - `material_type`
  - `color`
  - `printer_id` / `ams_slot` (optional)
  - `estimated_remaining`
  - `low_stock_threshold`

### TimelapseAsset
- Represents a timelapse associated with a specific print attempt.
- Key attributes:
  - `id`
  - `print_attempt_id`
  - `source_path` or reference
  - `youtube_video_id`
  - `youtube_url`
  - `visibility_internal` (boolean)
  - `visibility_customer` (boolean)

### SyncEvent / AuditLog
- Records connector↔Printing-web syncs and admin actions.
- Key attributes:
  - `id`
  - `event_type`
  - `actor` (admin/service)
  - `payload_summary`
  - `created_at`

