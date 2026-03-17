import { BambuLanClient } from "../../adapters/bambuLan/client.js";
import { QueueService } from "./queue.service.js";
import { PrintAttemptService } from "./printAttempt.service.js";

export class DispatchService {
  private isDispatching = false;

  constructor(
    private readonly queueService: QueueService,
    private readonly printAttemptService: PrintAttemptService,
    private readonly bambuLanClient: BambuLanClient
  ) {}

  async runOnce(): Promise<void> {
    if (this.isDispatching) return;
    this.isDispatching = true;
    let currentAttemptId: string | null = null;
    try {
      const job = this.queueService.dequeue();
      if (!job) return;
      currentAttemptId = job.attemptId;

      await this.printAttemptService.updateAttemptStatus(job.attemptId, "starting");
      // Placeholder integration point for actual Bambu dispatch.
      await this.bambuLanClient.discover();
      await this.printAttemptService.updateAttemptStatus(job.attemptId, "printing");
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown-dispatch-error";
      if (currentAttemptId) {
        await this.printAttemptService.updateAttemptStatus(currentAttemptId, "failed", message);
      }
    } finally {
      this.isDispatching = false;
    }
  }
}
