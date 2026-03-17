import { queueDepthGauge } from "../../observability/metrics.js";

export interface QueuedJob {
  attemptId: string;
  printerId: string;
}

export class QueueService {
  private readonly queue: QueuedJob[] = [];

  enqueue(job: QueuedJob): void {
    this.queue.push(job);
    queueDepthGauge.set(this.queue.length);
  }

  dequeue(): QueuedJob | undefined {
    const item = this.queue.shift();
    queueDepthGauge.set(this.queue.length);
    return item;
  }

  peekAll(): QueuedJob[] {
    return [...this.queue];
  }
}
