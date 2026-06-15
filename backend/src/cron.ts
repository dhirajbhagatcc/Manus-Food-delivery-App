import cron from "node-cron";
import { config } from "./config";
import { runDiscovery } from "./services/discover";

export function startCron(): void {
  if (!cron.validate(config.dailyCron)) {
    console.warn(`[cron] invalid DAILY_CRON "${config.dailyCron}" — scheduler disabled`);
    return;
  }
  cron.schedule(config.dailyCron, async () => {
    console.log("[cron] running daily discovery…");
    try {
      const result = await runDiscovery();
      console.log("[cron] discovery done:", JSON.stringify(result));
    } catch (err) {
      console.error("[cron] discovery failed:", err);
    }
  });
  console.log(`[cron] daily discovery scheduled at "${config.dailyCron}"`);
}
