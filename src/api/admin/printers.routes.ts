import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { adminAuthMiddleware } from "../../auth/adminAuth.middleware.js";
import { createServices } from "../../container.js";

const addPrinterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  host: z.string().min(1),
  serial: z.string().min(1),
  accessCode: z.string().min(1)
});

export const registerAdminPrinterRoutes: FastifyPluginAsync = async (app) => {
  const services = createServices();
  app.addHook("preHandler", adminAuthMiddleware);

  app.get("/", async () => {
    return services.printerService.listPrinters();
  });

  app.post("/discover", async () => {
    return services.printerService.discoverAndUpsert();
  });

  app.post("/register", async (request) => {
    const payload = addPrinterSchema.parse(request.body);
    services.bambuLanPrinters.push(payload);
    return services.printerService.discoverAndUpsert();
  });
};
