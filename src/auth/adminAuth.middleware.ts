import type { FastifyReply, FastifyRequest } from "fastify";

export async function adminAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const incoming = request.headers["x-admin-auth"];
  const expected = process.env.ADMIN_AUTH_SECRET;
  if (!expected || !incoming || incoming !== expected) {
    return reply.status(401).send({ error: "Unauthorized admin call" });
  }
}
