import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import { config } from "./config";

const dbPath = config.databasePath;
// Ensure the parent directory exists (e.g. ./data or a mounted disk).
const dir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      location TEXT,
      source_url TEXT,
      description TEXT,
      salary TEXT,
      status TEXT NOT NULL DEFAULT 'wishlist',
      position INTEGER NOT NULL DEFAULT 0,
      ai_driven_score INTEGER,
      ai_resist_score INTEGER,
      match_score INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE (job_id, type)
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      resume_text TEXT NOT NULL DEFAULT '',
      full_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      min_salary_usd INTEGER NOT NULL DEFAULT 50000,
      levels TEXT NOT NULL DEFAULT 'mid,senior',
      keywords TEXT NOT NULL DEFAULT '',
      locations TEXT NOT NULL DEFAULT 'remote worldwide',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS discoveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      external_id TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      location TEXT,
      url TEXT NOT NULL,
      description TEXT,
      salary TEXT,
      ai_driven_score INTEGER,
      ai_resist_score INTEGER,
      match_score INTEGER,
      reason TEXT,
      state TEXT NOT NULL DEFAULT 'new',
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (source, external_id)
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, position);
    CREATE INDEX IF NOT EXISTS idx_disc_state ON discoveries(state, match_score);
  `);

  // Ensure a single profile row exists.
  const row = db.prepare("SELECT id FROM profile WHERE id = 1").get();
  if (!row) {
    db.prepare("INSERT INTO profile (id) VALUES (1)").run();
  }
}
