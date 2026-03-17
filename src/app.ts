import Fastify from "fastify";
import sensible from "@fastify/sensible";
import { registerAdminPrinterRoutes } from "./api/admin/printers.routes.js";
import { registerHealthRoutes } from "./api/health.routes.js";
import { registerIntegrationHistoryRoutes } from "./api/integration/history.routes.js";
import { registerIntegrationInsightsRoutes } from "./api/integration/insights.routes.js";
import { registerIntegrationJobsRoutes } from "./api/integration/jobs.routes.js";
import { registerIntegrationTimelapseRoutes } from "./api/integration/timelapse.routes.js";
import { registerIntegrationWebhookRoutes } from "./api/integration/webhooks.routes.js";
import { registerMetricsRoutes } from "./api/metrics.routes.js";
import { buildLogger } from "./observability/logger.js";

export function buildApp() {
  const app = Fastify({
    loggerInstance: buildLogger()
  });

  app.register(sensible);
  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerMetricsRoutes, { prefix: "/metrics" });
  app.register(registerAdminPrinterRoutes, { prefix: "/api/admin/printers" });
  app.register(registerIntegrationJobsRoutes, { prefix: "/api/integration/jobs" });
  app.register(registerIntegrationHistoryRoutes, { prefix: "/api/integration/history" });
  app.register(registerIntegrationInsightsRoutes, { prefix: "/api/integration/insights" });
  app.register(registerIntegrationTimelapseRoutes, { prefix: "/api/integration/timelapses" });
  app.register(registerIntegrationWebhookRoutes, { prefix: "/api/integration/webhooks" });

  return app;
}
