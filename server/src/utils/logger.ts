import { env } from "../config/env.js";

type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, boolean | number | string | null | undefined>;

export class Logger {
  info(scope: string, message: string, meta?: LogMeta) {
    this.write("info", scope, message, meta);
  }

  warn(scope: string, message: string, meta?: LogMeta) {
    this.write("warn", scope, message, meta);
  }

  error(scope: string, message: string, meta?: LogMeta) {
    this.write("error", scope, message, meta);
  }

  shortId(value: string | null | undefined) {
    if (!value) {
      return "unknown";
    }

    return value.length > 10 ? value.slice(0, 8) : value;
  }

  private write(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
    const details = this.formatMeta(meta);
    const line = `[${this.time()}] ${level.toUpperCase()} ${scope} ${message}${details}`;

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  private formatMeta(meta?: LogMeta) {
    const withInstance = {
      instance: env.INSTANCE_NAME,
      ...meta
    };

    const details = Object.entries(withInstance)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(" ");

    return details ? ` ${details}` : "";
  }

  private time() {
    return new Date().toISOString().slice(11, 19);
  }
}

export const logger = new Logger();
