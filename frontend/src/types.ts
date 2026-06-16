export type JobStatus =
  | "wishlist"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export const COLUMNS: { id: JobStatus; label: string; accent: string }[] = [
  { id: "wishlist", label: "Wishlist", accent: "bg-slate-400" },
  { id: "applied", label: "Applied", accent: "bg-blue-500" },
  { id: "interviewing", label: "Interviewing", accent: "bg-amber-500" },
  { id: "offer", label: "Offer", accent: "bg-emerald-500" },
  { id: "rejected", label: "Rejected", accent: "bg-rose-400" },
];

export type KitType =
  | "cover_letter"
  | "resume_bullets"
  | "interview_questions"
  | "company_brief";

export const KIT_META: { type: KitType; label: string; icon: string }[] = [
  { type: "cover_letter", label: "Cover Letter", icon: "✍️" },
  { type: "resume_bullets", label: "Resume Bullets", icon: "📌" },
  { type: "interview_questions", label: "Interview Questions", icon: "❓" },
  { type: "company_brief", label: "Company Brief", icon: "🏢" },
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
  min_salary_usd: number;
  levels: string;
  keywords: string;
  locations: string;
  updated_at: string;
}

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
  state: string;
  fetched_at: string;
}
