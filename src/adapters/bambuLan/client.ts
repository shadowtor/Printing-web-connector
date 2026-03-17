import type { BambuPrinterDescriptor, BambuPrinterSnapshot } from "./types.js";

export class BambuLanClient {
  constructor(private readonly printers: BambuPrinterDescriptor[]) {}

  async discover(): Promise<BambuPrinterDescriptor[]> {
    // Placeholder for real LAN discovery. Uses configured printers until discovery is implemented.
    return this.printers;
  }

  async fetchSnapshot(printer: BambuPrinterDescriptor): Promise<BambuPrinterSnapshot> {
    // Placeholder for real LAN telemetry call.
    return {
      serial: printer.serial,
      state: "idle",
      model: "Bambu-Unknown",
      amsPresent: false
    };
  }
}
