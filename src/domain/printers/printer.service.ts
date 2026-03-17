import { BambuLanClient } from "../../adapters/bambuLan/client.js";
import type { BambuPrinterDescriptor } from "../../adapters/bambuLan/types.js";
import { PrinterRepository } from "./printer.repository.js";

export class PrinterService {
  constructor(
    private readonly repository: PrinterRepository,
    private readonly bambuLanClient: BambuLanClient
  ) {}

  async discoverAndUpsert() {
    const discovered = await this.bambuLanClient.discover();
    const upserts = discovered.map((printer) => this.upsertDiscoveredPrinter(printer));
    return Promise.all(upserts);
  }

  async listPrinters() {
    return this.repository.list();
  }

  private async upsertDiscoveredPrinter(printer: BambuPrinterDescriptor) {
    const snapshot = await this.bambuLanClient.fetchSnapshot(printer);
    return this.repository.upsertBySerial({
      externalId: printer.id,
      name: printer.name,
      model: snapshot.model,
      serial: printer.serial,
      host: printer.host,
      amsPresent: snapshot.amsPresent,
      nozzleConfig: snapshot.nozzleConfig,
      firmwareVersion: snapshot.firmwareVersion
    });
  }
}
