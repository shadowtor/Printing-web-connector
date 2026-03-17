import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { serviceAuthMiddleware } from "../../auth/serviceAuth.middleware.js";
import { createServices } from "../../container.js";

const webhookSchema = z.object({
  eventType: z.string().min(1),
  payload: z.record(z.string(), z.unknown())
});

export const registerIntegrationWebhookRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", serviceAuthMiddleware);

  app.post("/", async (request) => {
    const body = webhookSchema.parse(request.body);
    await services.syncRepository.record("inbound", body.eventType, "received");
    return { status: "accepted" };
  });
};
