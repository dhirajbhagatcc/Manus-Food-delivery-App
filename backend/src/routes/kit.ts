import { Router } from "express";
import { db } from "../db";
import { getJob, getProfile } from "../repo";
import { KitType, KIT_TYPES, Kit } from "../types";
import { generateKitPiece } from "../services/kit";

export const kitRouter = Router();

// List existing kit pieces for a job.
kitRouter.get("/:id/kit", (req, res) => {
  const jobId = Number(req.params.id);
  const kits = db
    .prepare("SELECT * FROM kits WHERE job_id = ? ORDER BY type")
    .all(jobId) as unknown as Kit[];
  res.json(kits);
});

// Generate one piece (?type=...) or all four if no/`all` type given.
kitRouter.post("/:id/kit", async (req, res) => {
  const jobId = Number(req.params.id);
  const job = getJob(jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const requested: string = req.body?.type || "all";
  const types: KitType[] =
    requested === "all" ? KIT_TYPES : KIT_TYPES.filter((t) => t === requested);
  if (types.length === 0) {
    res.status(400).json({ error: "Invalid kit type" });
    return;
  }

  const profile = getProfile();
  const upsert = db.prepare(
    `INSERT INTO kits (job_id, type, content) VALUES (?, ?, ?)
     ON CONFLICT(job_id, type) DO UPDATE SET content = excluded.content, created_at = datetime('now')`
  );

  try {
    const results: Kit[] = [];
    for (const type of types) {
      const content = await generateKitPiece(type, job, profile);
      upsert.run(jobId, type, content);
      results.push(
        db
          .prepare("SELECT * FROM kits WHERE job_id = ? AND type = ?")
          .get(jobId, type) as unknown as Kit
      );
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
