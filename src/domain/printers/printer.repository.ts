import type { PrinterState } from "@prisma/client";
import { prisma } from "../../db/client.js";

export interface UpsertPrinterInput {
  externalId?: string;
  name: string;
  model: string;
  serial: string;
  host: string;
  amsPresent?: boolean;
  nozzleConfig?: string;
  firmwareVersion?: string;
}

export class PrinterRepository {
  async list() {
    return prisma.printer.findMany({ orderBy: { createdAt: "asc" } });
  }

  async upsertBySerial(input: UpsertPrinterInput) {
    return prisma.printer.upsert({
      where: { serial: input.serial },
      create: {
        externalId: input.externalId,
        name: input.name,
        model: input.model,
        serial: input.serial,
        host: input.host,
        amsPresent: input.amsPresent ?? false,
        nozzleConfig: input.nozzleConfig,
        firmwareVersion: input.firmwareVersion
      },
      update: {
        externalId: input.externalId,
        name: input.name,
        model: input.model,
        host: input.host,
        amsPresent: input.amsPresent ?? false,
        nozzleConfig: input.nozzleConfig,
        firmwareVersion: input.firmwareVersion
      }
    });
  }

  async updateState(printerId: string, state: PrinterState, reason?: string) {
    const updated = await prisma.printer.update({
      where: { id: printerId },
      data: { normalizedState: state }
    });

    await prisma.printerStatusHistory.create({
      data: {
        printerId,
        state,
        reason
      }
    });

    return updated;
  }
}
