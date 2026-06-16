import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { config } from "./config";
import { initSchema } from "./db";
import { requireAuth } from "./auth";
import { startCron } from "./cron";

import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { profileRouter } from "./routes/profile";
import { kitRouter } from "./routes/kit";
import { discoverRouter } from "./routes/discover";

initSchema();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Health check (no auth) for hosting platforms.
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    ai: config.hasAnthropic(),
    smtp: config.hasSmtp(),
    adzuna: config.hasAdzuna(),
  });
});

// Auth endpoints are public; everything else under /api requires a session.
app.use("/api/auth", authRouter);
app.use("/api", requireAuth);
app.use("/api/jobs", jobsRouter);
app.use("/api/jobs", kitRouter); // adds /:id/kit
app.use("/api/profile", profileRouter);
app.use("/api/discover", discoverRouter);

// Serve the built frontend in production.
const clientDir = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.listen(config.port, () => {
  console.log(`ApplyTrack API listening on http://localhost:${config.port}`);
  if (!config.hasAnthropic()) {
    console.warn("⚠  ANTHROPIC_API_KEY not set — AI features will return errors.");
  }
  startCron();
});
