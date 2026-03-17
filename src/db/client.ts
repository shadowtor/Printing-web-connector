import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

const prismaClient =
  databaseUrl && databaseUrl.length > 0
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl })
      })
    : null;

export const prisma = prismaClient as PrismaClient;

export async function isDatabaseReady(): Promise<boolean> {
  if (!prismaClient) {
    return false;
  }
  try {
    await prismaClient.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
