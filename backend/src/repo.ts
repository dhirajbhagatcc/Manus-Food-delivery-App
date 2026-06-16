import { db } from "./db";
import { Job, Profile, Discovery, JobStatus } from "./types";

export function getProfile(): Profile {
  return db.prepare("SELECT * FROM profile WHERE id = 1").get() as unknown as Profile;
}

export function getJob(id: number): Job | undefined {
  return db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as unknown as
    | Job
    | undefined;
}

export function listJobs(): Job[] {
  return db
    .prepare("SELECT * FROM jobs ORDER BY status, position, id")
    .all() as unknown as Job[];
}

export function nextPosition(status: JobStatus): number {
  const row = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM jobs WHERE status = ?")
    .get(status) as { pos: number };
  return row.pos;
}

export function existingExternalIds(): Set<string> {
  const rows = db
    .prepare("SELECT source, external_id FROM discoveries")
    .all() as unknown as Array<{ source: string; external_id: string }>;
  return new Set(rows.map((r) => `${r.source}:${r.external_id}`));
}

export function insertDiscovery(d: Omit<Discovery, "id" | "fetched_at">): void {
  db.prepare(
    `INSERT OR IGNORE INTO discoveries
      (source, external_id, title, company, location, url, description, salary,
       ai_driven_score, ai_resist_score, match_score, reason, state)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    d.source,
    d.external_id,
    d.title,
    d.company,
    d.location,
    d.url,
    d.description,
    d.salary,
    d.ai_driven_score,
    d.ai_resist_score,
    d.match_score,
    d.reason,
    d.state
  );
}

export function listDiscoveries(state?: string): Discovery[] {
  if (state) {
    return db
      .prepare(
        "SELECT * FROM discoveries WHERE state = ? ORDER BY match_score DESC, fetched_at DESC"
      )
      .all(state) as unknown as Discovery[];
  }
  return db
    .prepare("SELECT * FROM discoveries ORDER BY match_score DESC, fetched_at DESC")
    .all() as unknown as Discovery[];
}
