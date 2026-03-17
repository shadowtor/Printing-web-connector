import { prisma } from "../../db/client.js";

export class TimelapseRepository {
  async createForAttempt(printAttemptId: string, sourcePath?: string) {
    return prisma.timelapseAsset.create({
      data: {
        printAttemptId,
        sourcePath
      }
    });
  }

  async listByOrderItem(printingWebOrderItemId: string) {
    return prisma.timelapseAsset.findMany({
      where: {
        printAttempt: {
          orderItemLink: {
            printingWebOrderItemId
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }
}
