import type { FastifyPluginAsync } from "fastify";
import { isDatabaseReady } from "../db/client.js";

export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/live", async () => ({
    status: "ok",
    service: "bambu-connector"
  }));

  app.get("/ready", async (_request, reply) => {
    const databaseReady = await isDatabaseReady();
    if (!databaseReady) {
      return reply.status(503).send({
        status: "not-ready",
        checks: {
          database: "down"
        }
      });
    }

    return {
      status: "ready",
      service: "bambu-connector",
      checks: {
        database: "up"
      }
    };
  });
};
