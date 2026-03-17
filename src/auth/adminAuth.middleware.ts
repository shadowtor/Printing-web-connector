import type { FastifyReply, FastifyRequest } from "fastify";
import { createServices } from "../container.js";

export async function adminAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const services = createServices();
  const incoming = request.headers["x-admin-auth"];
  const expected = services.config.ADMIN_AUTH_SECRET;
  if (!incoming || incoming !== expected) {
    return reply.status(401).send({ error: "Unauthorized admin call" });
  }
}
