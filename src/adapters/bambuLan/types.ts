import type { NormalizedPrinterState } from "../../domain/printers/printer.js";

export interface BambuPrinterDescriptor {
  id: string;
  name: string;
  host: string;
  serial: string;
  accessCode: string;
}

export interface BambuPrinterSnapshot {
  serial: string;
  state: NormalizedPrinterState;
  model: string;
  firmwareVersion?: string;
  amsPresent?: boolean;
  nozzleConfig?: string;
}
