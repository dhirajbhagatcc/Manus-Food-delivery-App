import dotenv from "dotenv";
import path from "path";

// Load .env from backend dir, then project root as fallback.
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

function bool(v: string | undefined, def = false): boolean {
  if (v === undefined) return def;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",

  loginPassword: process.env.LOGIN_PASSWORD || "change-me",
  sessionSecret: process.env.SESSION_SECRET || "dev-insecure-secret",

  databasePath: process.env.DATABASE_PATH || "./data/applytrack.sqlite",

  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",

  adzunaAppId: process.env.ADZUNA_APP_ID || "",
  adzunaKey: process.env.ADZUNA_KEY || "",

  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    to: process.env.DIGEST_TO || "",
  },

  dailyCron: process.env.DAILY_CRON || "0 7 * * *",
  appUrl: process.env.APP_URL || "http://localhost:4000",

  hasAnthropic(): boolean {
    return Boolean(this.anthropicApiKey);
  },
  hasSmtp(): boolean {
    return Boolean(this.smtp.host && this.smtp.user && this.smtp.pass && this.smtp.to);
  },
  hasAdzuna(): boolean {
    return Boolean(this.adzunaAppId && this.adzunaKey);
  },
};

export const _bool = bool;
