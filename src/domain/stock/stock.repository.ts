import { prisma } from "../../db/client.js";

export class StockRepository {
  async listSignals() {
    const records = await prisma.filamentStock.findMany({ orderBy: { materialType: "asc" } });
    return records.map((record) => ({
      materialType: record.materialType,
      color: record.color,
      estimatedRemaining: record.estimatedRemaining,
      threshold: record.lowStockThreshold,
      isLow: record.estimatedRemaining <= record.lowStockThreshold
    }));
  }

  async registerConsumption(stockId: string, consumed: number, details?: string) {
    const updated = await prisma.filamentStock.update({
      where: { id: stockId },
      data: { estimatedRemaining: { decrement: consumed } }
    });
    await prisma.stockEvent.create({
      data: {
        filamentStockId: stockId,
        eventType: "consumed",
        delta: -consumed,
        details
      }
    });
    return updated;
  }
}
