import { Router } from "express";
import { db } from "../db";
import { listDiscoveries, nextPosition, getJob } from "../repo";
import { Discovery } from "../types";
import { runDiscovery } from "../services/discover";

export const discoverRouter = Router();

// List discoveries (default: only "new").
discoverRouter.get("/", (req, res) => {
  const state = (req.query.state as string) || "new";
  res.json(listDiscoveries(state === "all" ? undefined : state));
});

// Manually trigger a sourcing run.
discoverRouter.post("/run", async (_req, res) => {
  try {
    const result = await runDiscovery();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Add a discovery to the board as a Wishlist card.
discoverRouter.post("/:id/add", (req, res) => {
  const id = Number(req.params.id);
  const d = db.prepare("SELECT * FROM discoveries WHERE id = ?").get(id) as
    | Discovery
    | undefined;
  if (!d) {
    res.status(404).json({ error: "Discovery not found" });
    return;
  }
  const position = nextPosition("wishlist");
  const info = db
    .prepare(
      `INSERT INTO jobs
        (title, company, location, source_url, description, salary, status, position,
         ai_driven_score, ai_resist_score, match_score)
       VALUES (?, ?, ?, ?, ?, ?, 'wishlist', ?, ?, ?, ?)`
    )
    .run(
      d.title,
      d.company,
      d.location,
      d.url,
      d.description,
      d.salary,
      position,
      d.ai_driven_score,
      d.ai_resist_score,
      d.match_score
    );
  db.prepare("UPDATE discoveries SET state = 'added' WHERE id = ?").run(id);
  res.json(getJob(Number(info.lastInsertRowid)));
});

// Dismiss a discovery so it stops showing in the inbox.
discoverRouter.post("/:id/dismiss", (req, res) => {
  const id = Number(req.params.id);
  db.prepare("UPDATE discoveries SET state = 'dismissed' WHERE id = ?").run(id);
  res.json({ ok: true });
});
