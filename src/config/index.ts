import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8081),
  HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  PRINTING_WEB_BASE_URL: z.string().url(),
  SERVICE_AUTH_SHARED_SECRET: z.string().min(16),
  BAMBU_PRINTERS_JSON: z.string().default("[]"),
  YOUTUBE_UPLOAD_ENABLED: z
    .string()
    .default("false")
    .transform((value) => value.toLowerCase() === "true"),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_REFRESH_TOKEN: z.string().optional(),
  CONNECTOR_DATA_DIR: z.string().default("./data")
});

export type AppConfig = z.infer<typeof envSchema> & {
  bambuPrinters: Array<{
    id: string;
    name: string;
    host: string;
    serial: string;
    accessCode: string;
  }>;
};

export function loadConfig(): AppConfig {
  const parsed = envSchema.parse(process.env);
  const bambuPrinters = parsePrinterConfig(parsed.BAMBU_PRINTERS_JSON);
  return {
    ...parsed,
    bambuPrinters
  };
}

function parsePrinterConfig(
  rawJson: string
): Array<{ id: string; name: string; host: string; serial: string; accessCode: string }> {
  const printerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    host: z.string().min(1),
    serial: z.string().min(1),
    accessCode: z.string().min(1)
  });
  const listSchema = z.array(printerSchema);
  const parsed = JSON.parse(rawJson);
  return listSchema.parse(parsed);
}
