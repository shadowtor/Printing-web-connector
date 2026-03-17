export const attemptStatuses = [
  "queued",
  "starting",
  "printing",
  "completed",
  "failed",
  "cancelled",
  "interrupted"
] as const;

export type AttemptStatus = (typeof attemptStatuses)[number];

export interface CreateAttemptInput {
  printingWebOrderId: string;
  printingWebOrderItemId: string;
  printerId: string;
  reason?: string;
  notes?: string;
}
