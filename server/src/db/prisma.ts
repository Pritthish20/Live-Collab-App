import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter
});

class Database {
  private isConnected = false;

  constructor(private readonly client: PrismaClient) {}

  async connect() {
    if (this.isConnected) {
      return;
    }

    await this.client.$connect();
    this.isConnected = true;
    logger.info("db", "connected", {
      target: this.getDatabaseTarget()
    });
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    await this.client.$disconnect();
    this.isConnected = false;
    logger.info("db", "disconnected");
  }

  private getDatabaseTarget() {
    try {
      const databaseUrl = new URL(env.DATABASE_URL);
      const databaseName = databaseUrl.pathname.replace("/", "") || "default";
      const port = databaseUrl.port ? `:${databaseUrl.port}` : "";

      return `${databaseUrl.hostname}${port}/${databaseName}`;
    } catch {
      return "configured database";
    }
  }
}

export const database = new Database(prisma);

export function connectDatabase() {
  return database.connect();
}

export function disconnectDatabase() {
  return database.disconnect();
}
