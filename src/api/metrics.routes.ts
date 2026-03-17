import type { FastifyPluginAsync } from "fastify";
import { renderMetrics } from "../observability/metrics.js";

export const registerMetricsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (_request, reply) => {
    const metrics = await renderMetrics();
    reply.header("Content-Type", "text/plain; version=0.0.4");
    return reply.send(metrics);
  });
};
