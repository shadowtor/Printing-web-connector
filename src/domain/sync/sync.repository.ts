import { prisma } from "../../db/client.js";
import type { OutboxService } from "../../outbox/outbox.service.js";

const OUTBOX_DESTINATION = "postgres_sync";

export class SyncRepository {
  constructor(private readonly outbox?: OutboxService) {}

  async record(direction: string, operation: string, status: string, details?: string) {
    try {
      return await prisma.syncEvent.create({
        data: {
          direction,
          operation,
          status,
          details
        }
      });
    } catch (err) {
      if (this.outbox) {
        this.outbox.enqueue(OUTBOX_DESTINATION, {
          direction,
          operation,
          status,
          details
        });
      }
      throw err;
    }
  }
}
