import { attemptStatusCounter } from "../../observability/metrics.js";
import { AuditService } from "../audit/audit.service.js";
import { PrintAttemptRepository } from "./printAttempt.repository.js";
import type { CreateAttemptInput } from "./printAttempt.js";

export class PrintAttemptService {
  constructor(
    private readonly repository: PrintAttemptRepository,
    private readonly auditService: AuditService
  ) {}

  async createAttempt(input: CreateAttemptInput) {
    const link = await this.repository.ensureOrderItemLink(
      input.printingWebOrderId,
      input.printingWebOrderItemId
    );
    const attempt = await this.repository.createAttempt(link.id, input.printerId, input.reason, input.notes);
    attemptStatusCounter.inc({ status: attempt.status });
    await this.auditService.record({
      actorType: "service",
      eventType: "attempt.created",
      payloadSummary: `Attempt ${attempt.attemptNumber} created for ${input.printingWebOrderItemId}`,
      printAttemptId: attempt.id
    });
    return attempt;
  }

  async listAttempts(printingWebOrderItemId: string) {
    return this.repository.listByOrderItem(printingWebOrderItemId);
  }

  async updateAttemptStatus(attemptId: string, status: Parameters<PrintAttemptRepository["setStatus"]>[1], reason?: string) {
    const attempt = await this.repository.setStatus(attemptId, status, reason);
    attemptStatusCounter.inc({ status });
    await this.auditService.record({
      actorType: "service",
      eventType: `attempt.${status}`,
      payloadSummary: reason,
      printAttemptId: attemptId
    });
    return attempt;
  }
}
