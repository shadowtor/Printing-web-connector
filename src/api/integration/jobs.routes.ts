import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { serviceAuthMiddleware } from "../../auth/serviceAuth.middleware.js";
import { createServices } from "../../container.js";

const submitJobSchema = z.object({
  printingWebOrderId: z.string().min(1),
  printingWebOrderItemId: z.string().min(1),
  printerId: z.string().min(1),
  reason: z.string().optional(),
  notes: z.string().optional()
});

export const registerIntegrationJobsRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", serviceAuthMiddleware);

  app.post("/", async (request) => {
    const payload = submitJobSchema.parse(request.body);
    const attempt = await services.printAttemptService.createAttempt(payload);
    services.queueService.enqueue({ attemptId: attempt.id, printerId: payload.printerId });
    return {
      attemptId: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status
    };
  });

  app.get("/queue", async () => {
    return { queue: services.queueService.peekAll() };
  });

  app.post("/:attemptId/status", async (request) => {
    const { attemptId } = request.params as { attemptId: string };
    const payload = z
      .object({
        status: z.enum([
          "queued",
          "starting",
          "printing",
          "completed",
          "failed",
          "cancelled",
          "interrupted"
        ]),
        reason: z.string().optional()
      })
      .parse(request.body);

    const attempt = await services.printAttemptService.updateAttemptStatus(
      attemptId,
      payload.status,
      payload.reason
    );
    return attempt;
  });
};
