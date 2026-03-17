import { buildApp } from "./app.js";
import { loadConfig } from "./config/index.js";
import { redactConfigForLogging } from "./config/secrets.js";
import { createServices } from "./container.js";

async function start(): Promise<void> {
  const config = loadConfig();
  const app = buildApp();
  const services = createServices();
  await services.outboxService.open();
  app.log.info({ config: redactConfigForLogging(config) }, "Starting connector service");
  services.outboxService.setDeliver(async (row) => {
    if (row.destination === "postgres_sync") {
      const p = services.outboxService.parsePayload<{
        direction: string;
        operation: string;
        status: string;
        details?: string;
      }>(row);
      try {
        await services.syncRepository.record(p.direction, p.operation, p.status, p.details);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  });
  services.outboxService.startReplayLoop();
  services.printerPoller.start();
  setInterval(() => {
    void services.dispatchService.runOnce();
  }, 5000);
  await app.listen({ port: config.PORT, host: config.HOST });
}

start().catch((error) => {
  process.stderr.write(`Failed to start server: ${String(error)}\n`);
  process.exit(1);
});
