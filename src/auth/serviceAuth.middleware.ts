import type { FastifyReply, FastifyRequest } from "fastify";
import { createServices } from "../container.js";

export async function serviceAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const services = createServices();
  const incoming = request.headers["x-service-auth"];
  const expected = services.config.SERVICE_AUTH_SHARED_SECRET;
  if (!incoming || incoming !== expected) {
    return reply.status(401).send({ error: "Unauthorized service call" });
  }
}
