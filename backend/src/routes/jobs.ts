import { Router } from "express";
import { db } from "../db";
import { Job, JobStatus, JOB_STATUSES } from "../types";
import { getJob, listJobs, nextPosition } from "../repo";
import { extractJob } from "../services/extract";

export const jobsRouter = Router();

// List all jobs (board data).
jobsRouter.get("/", (_req, res) => {
  res.json(listJobs());
});

// Create a job from a URL or pasted text (AI extraction), or raw fields.
jobsRouter.post("/", async (req, res) => {
  const { url, text, manual } = req.body || {};
  try {
    let fields: {
      title: string;
      company: string;
      location: string | null;
      salary: string | null;
      description: string | null;
    };

    if (manual && manual.title) {
      fields = {
        title: String(manual.title),
        company: String(manual.company || ""),
        location: manual.location ? String(manual.location) : null,
        salary: manual.salary ? String(manual.salary) : null,
        description: manual.description ? String(manual.description) : null,
      };
    } else if (url || text) {
      fields = await extractJob({ url, text });
    } else {
      res.status(400).json({ error: "Provide a url, text, or manual fields." });
      return;
    }

    const status: JobStatus = "wishlist";
    const position = nextPosition(status);
    const info = db
      .prepare(
        `INSERT INTO jobs (title, company, location, source_url, description, salary, status, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        fields.title,
        fields.company,
        fields.location,
        url || null,
        fields.description,
        fields.salary,
        status,
        position
      );
    res.json(getJob(Number(info.lastInsertRowid)));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const EDITABLE = [
  "title",
  "company",
  "location",
  "source_url",
  "description",
  "salary",
  "notes",
] as const;

// Update fields and/or move/reorder within the board.
jobsRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const job = getJob(id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const updates: string[] = [];
  const values: any[] = [];

  for (const key of EDITABLE) {
    if (key in req.body) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }

  if ("status" in req.body) {
    const status = req.body.status as JobStatus;
    if (!JOB_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    updates.push("status = ?");
    values.push(status);
    // Default to end of the new column unless an explicit position is given.
    if (!("position" in req.body)) {
      updates.push("position = ?");
      values.push(nextPosition(status));
    }
  }

  if ("position" in req.body) {
    updates.push("position = ?");
    values.push(Number(req.body.position));
  }

  if (updates.length === 0) {
    res.json(job);
    return;
  }

  updates.push("updated_at = datetime('now')");
  db.prepare(`UPDATE jobs SET ${updates.join(", ")} WHERE id = ?`).run(...values, id);
  res.json(getJob(id));
});

// Bulk reorder: accepts [{id, status, position}] to persist a drag result.
jobsRouter.post("/reorder", (req, res) => {
  const items = req.body?.items as Array<{
    id: number;
    status: JobStatus;
    position: number;
  }>;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: "items array required" });
    return;
  }
  const stmt = db.prepare(
    "UPDATE jobs SET status = ?, position = ?, updated_at = datetime('now') WHERE id = ?"
  );
  for (const it of items) {
    if (JOB_STATUSES.includes(it.status)) {
      stmt.run(it.status, Number(it.position), Number(it.id));
    }
  }
  res.json(listJobs());
});

jobsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
  res.json({ ok: true });
});
