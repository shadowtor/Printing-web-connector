import type { FastifyPluginAsync } from "fastify";
import { createServices } from "../container.js";
import { renderMetrics } from "../observability/metrics.js";

export const registerMetricsRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  const metricsSecret = services.config.METRICS_AUTH_SECRET;
  if (metricsSecret) {
    app.addHook("preHandler", async (request, reply) => {
      const authHeader = request.headers.authorization;
      const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      if (bearer !== metricsSecret) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
    });
  }
  app.get("/", async (_request, reply) => {
    const metrics = await renderMetrics();
    reply.header("Content-Type", "text/plain; version=0.0.4");
    return reply.send(metrics);
  });
};
