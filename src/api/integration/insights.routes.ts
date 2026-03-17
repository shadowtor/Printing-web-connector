import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { serviceAuthMiddleware } from "../../auth/serviceAuth.middleware.js";
import { createServices } from "../../container.js";

const estimateSchema = z.object({
  durationMinutes: z.number().positive(),
  averageWattage: z.number().positive().optional()
});

export const registerIntegrationInsightsRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", serviceAuthMiddleware);

  app.get("/stock-signals", async () => {
    const signals = await services.stockService.getSignals();
    return { signals };
  });

  app.post("/stock-signals/emit", async () => {
    const lowSignals = await services.stockService.emitLowStockSignals();
    return { lowSignals };
  });

  app.post("/power-estimate", async (request) => {
    const payload = estimateSchema.parse(request.body);
    return { powerUsageKwh: services.powerService.estimateKwh(payload) };
  });
};
