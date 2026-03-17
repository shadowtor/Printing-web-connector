import pino, { type LoggerOptions } from "pino";

export function buildLogger(): pino.Logger {
  const options: LoggerOptions = {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true }
          }
        : undefined
  };

  return pino(options);
}
