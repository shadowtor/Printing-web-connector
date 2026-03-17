import { attemptStatusCounter } from "../../observability/metrics.js";
import { PrinterRepository } from "./printer.repository.js";
import { PrinterService } from "./printer.service.js";

export class PrinterPoller {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly intervalMs: number;

  constructor(
    private readonly printerService: PrinterService,
    private readonly repository: PrinterRepository,
    intervalMs = 15000
  ) {
    this.intervalMs = intervalMs;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const printers = await this.printerService.discoverAndUpsert();
      for (const printer of printers) {
        await this.repository.updateState(printer.id, "idle");
      }
      attemptStatusCounter.inc({ status: "queued" }, 0);
    } finally {
      this.isRunning = false;
    }
  }
}
