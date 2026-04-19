import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

for (const envPath of [resolve(process.cwd(), "..", ".env"), resolve(process.cwd(), ".env")]) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  SERVER_PORT: z.coerce.number().int().positive().default(4000),
  COLLAB_PORT: z.coerce.number().int().positive().default(1234),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  INSTANCE_NAME: z.string().min(1),
  COOKIE_NAME: z.string().default("collabpad_session"),
  NODE_ENV: z.string().default("development")
});

export const env = envSchema.parse(process.env);
