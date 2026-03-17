import { Counter, Gauge, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

export const queueDepthGauge = new Gauge({
  name: "connector_queue_depth",
  help: "Current number of queued print attempts",
  registers: [metricsRegistry]
});

export const attemptStatusCounter = new Counter({
  name: "connector_attempt_status_total",
  help: "Total print attempts by status",
  labelNames: ["status"],
  registers: [metricsRegistry]
});

export const syncFailureCounter = new Counter({
  name: "connector_sync_failures_total",
  help: "Total sync failures between connector and Printing-web",
  registers: [metricsRegistry]
});

export const timelapseUploadFailureCounter = new Counter({
  name: "connector_timelapse_upload_failures_total",
  help: "Total timelapse upload failures",
  registers: [metricsRegistry]
});

export async function renderMetrics(): Promise<string> {
  return metricsRegistry.metrics();
}
