import { Router } from "express";
import { db } from "../db";
import { getProfile } from "../repo";

export const profileRouter = Router();

profileRouter.get("/", (_req, res) => {
  res.json(getProfile());
});

const EDITABLE = [
  "resume_text",
  "full_name",
  "email",
  "min_salary_usd",
  "levels",
  "keywords",
  "locations",
] as const;

profileRouter.put("/", (req, res) => {
  const updates: string[] = [];
  const values: any[] = [];
  for (const key of EDITABLE) {
    if (key in req.body) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    db.prepare(`UPDATE profile SET ${updates.join(", ")} WHERE id = 1`).run(...values);
  }
  res.json(getProfile());
});
