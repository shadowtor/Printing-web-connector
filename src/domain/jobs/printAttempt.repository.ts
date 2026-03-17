import type { AttemptStatus } from "@prisma/client";
import { prisma } from "../../db/client.js";

export class PrintAttemptRepository {
  async ensureOrderItemLink(printingWebOrderId: string, printingWebOrderItemId: string) {
    return prisma.orderItemLink.upsert({
      where: { printingWebOrderItemId },
      create: {
        printingWebOrderId,
        printingWebOrderItemId,
        status: "active"
      },
      update: {
        printingWebOrderId
      }
    });
  }

  async createAttempt(orderItemLinkId: string, printerId: string, reason?: string, notes?: string) {
    const latest = await prisma.printAttempt.findFirst({
      where: { orderItemLinkId },
      orderBy: { attemptNumber: "desc" }
    });
    const nextAttemptNumber = latest ? latest.attemptNumber + 1 : 1;

    return prisma.printAttempt.create({
      data: {
        orderItemLinkId,
        printerId,
        attemptNumber: nextAttemptNumber,
        status: "queued",
        reason,
        notes
      }
    });
  }

  async setStatus(attemptId: string, status: AttemptStatus, reason?: string) {
    return prisma.printAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        reason: reason ?? undefined,
        startedAt: status === "starting" ? new Date() : undefined,
        completedAt:
          status === "completed" || status === "failed" || status === "cancelled" || status === "interrupted"
            ? new Date()
            : undefined
      }
    });
  }

  async listByOrderItem(printingWebOrderItemId: string) {
    return prisma.printAttempt.findMany({
      where: { orderItemLink: { printingWebOrderItemId } },
      include: { timelapseAssets: true, printer: true },
      orderBy: { attemptNumber: "asc" }
    });
  }
}
