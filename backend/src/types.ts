export type JobStatus =
  | "wishlist"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export const JOB_STATUSES: JobStatus[] = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

export type KitType =
  | "cover_letter"
  | "resume_bullets"
  | "interview_questions"
  | "company_brief";

export const KIT_TYPES: KitType[] = [
  "cover_letter",
  "resume_bullets",
  "interview_questions",
  "company_brief",
];

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  source_url: string | null;
  description: string | null;
  salary: string | null;
  status: JobStatus;
  position: number;
  ai_driven_score: number | null;
  ai_resist_score: number | null;
  match_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Kit {
  id: number;
  job_id: number;
  type: KitType;
  content: string;
  created_at: string;
}

export interface Profile {
  id: number;
  resume_text: string;
  full_name: string;
  email: string;
  // preference fields
  min_salary_usd: number;
  levels: string; // comma-separated e.g. "mid,senior"
  keywords: string;
  locations: string; // free text preference, default "remote worldwide"
  updated_at: string;
}

export type DiscoveryState = "new" | "added" | "dismissed";

export interface Discovery {
  id: number;
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  description: string | null;
  salary: string | null;
  ai_driven_score: number | null;
  ai_resist_score: number | null;
  match_score: number | null;
  reason: string | null;
  state: DiscoveryState;
  fetched_at: string;
}

/** Normalized job pulled from an external source, before scoring/storage. */
export interface RawJob {
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  description: string | null;
  salary: string | null;
}
