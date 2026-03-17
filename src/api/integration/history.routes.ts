import type { FastifyPluginAsync } from "fastify";
import { serviceAuthMiddleware } from "../../auth/serviceAuth.middleware.js";
import { createServices } from "../../container.js";

export const registerIntegrationHistoryRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", serviceAuthMiddleware);

  app.get("/:printingWebOrderItemId", async (request) => {
    const { printingWebOrderItemId } = request.params as { printingWebOrderItemId: string };
    const attempts = await services.printAttemptService.listAttempts(printingWebOrderItemId);
    return { attempts };
  });
};
