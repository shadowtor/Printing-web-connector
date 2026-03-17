import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { serviceAuthMiddleware } from "../../auth/serviceAuth.middleware.js";
import { createServices } from "../../container.js";
import { buildVisibilityPolicy } from "../../domain/timelapse/timelapse.policy.js";

const createAssetSchema = z.object({
  printAttemptId: z.string().min(1),
  sourcePath: z.string().optional(),
  isSuccessful: z.boolean().default(false),
  approved: z.boolean().default(false)
});

export const registerIntegrationTimelapseRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", serviceAuthMiddleware);

  app.post("/", async (request) => {
    const payload = createAssetSchema.parse(request.body);
    const visibility = buildVisibilityPolicy(payload.isSuccessful, payload.approved);
    const asset = await services.timelapseRepository.createForAttempt(payload.printAttemptId, payload.sourcePath);
    return {
      ...asset,
      internalVisible: visibility.internalVisible,
      customerVisible: visibility.customerVisible
    };
  });

  app.get("/:printingWebOrderItemId", async (request) => {
    const { printingWebOrderItemId } = request.params as { printingWebOrderItemId: string };
    return services.timelapseRepository.listByOrderItem(printingWebOrderItemId);
  });

  app.post("/:assetId/upload", async (request) => {
    const { assetId } = request.params as { assetId: string };
    await services.timelapseUploader.upload(assetId);
    return { status: "ok" };
  });
};
