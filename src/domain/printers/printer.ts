export const normalizedPrinterStates = [
  "idle",
  "queued",
  "printing",
  "paused",
  "error",
  "completed",
  "offline"
] as const;

export type NormalizedPrinterState = (typeof normalizedPrinterStates)[number];

export interface PrinterMetadata {
  id: string;
  name: string;
  model: string;
  serial: string;
  host: string;
  amsPresent: boolean;
  nozzleConfig?: string | null;
  firmwareVersion?: string | null;
  normalizedState: NormalizedPrinterState;
}
