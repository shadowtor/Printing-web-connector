import { prisma } from "../../db/client.js";
import { syncFailureCounter } from "../../observability/metrics.js";
import { StockRepository } from "./stock.repository.js";

export class StockService {
  constructor(private readonly repository: StockRepository) {}

  async getSignals() {
    return this.repository.listSignals();
  }

  async emitLowStockSignals() {
    const signals = await this.repository.listSignals();
    const lowSignals = signals.filter((signal) => signal.isLow);
    for (const signal of lowSignals) {
      await prisma.restockRecommendation.create({
        data: {
          materialType: signal.materialType,
          recommendedGrams: Math.max(signal.threshold * 2 - signal.estimatedRemaining, signal.threshold),
          rationale: "Auto-generated low-stock recommendation"
        }
      });
      syncFailureCounter.inc();
    }
    return lowSignals;
  }
}
