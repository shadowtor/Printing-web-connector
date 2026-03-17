import type { AppConfig } from "./index.js";

const SECRET_FIELDS = new Set([
  "SERVICE_AUTH_SHARED_SECRET",
  "YOUTUBE_CLIENT_SECRET",
  "YOUTUBE_REFRESH_TOKEN"
]);

export function redactConfigForLogging(config: AppConfig): Record<string, unknown> {
  const entries = Object.entries(config).map(([key, value]) => {
    if (SECRET_FIELDS.has(key)) {
      return [key, "***REDACTED***"];
    }

    if (key === "bambuPrinters" && Array.isArray(value)) {
      const sanitized = value.map((printer) => ({
        id: printer.id,
        name: printer.name,
        host: printer.host,
        serial: printer.serial,
        accessCode: "***REDACTED***"
      }));
      return [key, sanitized];
    }

    return [key, value];
  });

  return Object.fromEntries(entries);
}
