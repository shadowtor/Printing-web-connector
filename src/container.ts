import { BambuLanClient } from "./adapters/bambuLan/client.js";
import { YouTubeClient } from "./adapters/youtube/client.js";
import { loadConfig } from "./config/index.js";
import { AuditService } from "./domain/audit/audit.service.js";
import { PowerService } from "./domain/costing/power.service.js";
import { PrintAttemptRepository } from "./domain/jobs/printAttempt.repository.js";
import { PrintAttemptService } from "./domain/jobs/printAttempt.service.js";
import { QueueService } from "./domain/jobs/queue.service.js";
import { DispatchService } from "./domain/jobs/dispatch.service.js";
import { PrinterPoller } from "./domain/printers/printer.poller.js";
import { PrinterRepository } from "./domain/printers/printer.repository.js";
import { PrinterService } from "./domain/printers/printer.service.js";
import { StockRepository } from "./domain/stock/stock.repository.js";
import { StockService } from "./domain/stock/stock.service.js";
import { TimelapseFetcher } from "./domain/timelapse/timelapse.fetcher.js";
import { TimelapseRepository } from "./domain/timelapse/timelapse.repository.js";
import { TimelapseUploader } from "./domain/timelapse/timelapse.uploader.js";
import { OutboxService } from "./outbox/outbox.service.js";
import { SyncRepository } from "./domain/sync/sync.repository.js";

let servicesSingleton: ReturnType<typeof buildServices> | null = null;

function buildServices() {
  const config = loadConfig();
  const bambuLanPrinters = [...config.bambuPrinters];
  const bambuLanClient = new BambuLanClient(bambuLanPrinters);
  const printerRepository = new PrinterRepository();
  const printerService = new PrinterService(printerRepository, bambuLanClient);
  const printerPoller = new PrinterPoller(printerService, printerRepository);
  const auditService = new AuditService();
  const printAttemptRepository = new PrintAttemptRepository();
  const printAttemptService = new PrintAttemptService(printAttemptRepository, auditService);
  const queueService = new QueueService();
  const dispatchService = new DispatchService(queueService, printAttemptService, bambuLanClient);
  const stockRepository = new StockRepository();
  const stockService = new StockService(stockRepository);
  const timelapseRepository = new TimelapseRepository();
  const youTubeClient = new YouTubeClient();
  const timelapseUploader = new TimelapseUploader(youTubeClient);
  const timelapseFetcher = new TimelapseFetcher();
  const powerService = new PowerService();
  const outboxService = new OutboxService(config.CONNECTOR_DATA_DIR);
  const syncRepository = new SyncRepository(outboxService);

  return {
    config,
    bambuLanPrinters,
    bambuLanClient,
    printerRepository,
    printerService,
    printerPoller,
    auditService,
    printAttemptRepository,
    printAttemptService,
    queueService,
    dispatchService,
    stockRepository,
    stockService,
    timelapseRepository,
    timelapseUploader,
    timelapseFetcher,
    powerService,
    syncRepository,
    outboxService
  };
}

export function createServices() {
  if (!servicesSingleton) {
    servicesSingleton = buildServices();
  }
  return servicesSingleton;
}
