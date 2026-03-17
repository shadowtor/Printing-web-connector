import { prisma } from "../../db/client.js";

export interface AuditRecordInput {
  printAttemptId?: string;
  actorType: string;
  actorId?: string;
  eventType: string;
  payloadSummary?: string;
}

export class AuditService {
  async record(input: AuditRecordInput) {
    return prisma.auditEvent.create({ data: input });
  }
}
