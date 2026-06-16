import { completeJson } from "../anthropic";
import { Profile, RawJob } from "../types";

export interface ScoredResult {
  index: number;
  ai_driven_score: number; // 0-100: role builds with / around AI
  ai_resist_score: number; // 0-100: role is hard to automate away
  match_score: number; // 0-100: fit vs the candidate's resume & prefs
  reason: string; // one short sentence
}

const SYSTEM = `You are a job-matching analyst. Given a candidate profile and a list of job
postings, score each job on three 0-100 axes:

- "ai_driven": how much the role involves building with or leveraging AI (high = AI-centric role).
- "ai_resist": how resistant the role is to being automated away by AI (high = relies on human
  judgment, strategy, relationships, leadership; low = highly routinizable/automatable).
- "match": fit between the job and THIS candidate's experience, level, and preferences.

Also give a one-sentence "reason" focused on fit.

Return ONLY a JSON array, one object per job in the same order, each:
{ "index": number, "ai_driven": number, "ai_resist": number, "match": number, "reason": string }`;

function profileBlock(p: Profile): string {
  return `Candidate preferences:
- Minimum salary: $${p.min_salary_usd} USD/yr (or equivalent)
- Levels wanted: ${p.levels}
- Work mode: ${p.locations}
- Keywords/interests: ${p.keywords || "(none specified)"}

Candidate resume:
"""
${(p.resume_text || "(no resume provided)").slice(0, 6000)}
"""`;
}

/** Score a batch of jobs in a single Claude call. */
export async function scoreJobs(
  jobs: RawJob[],
  profile: Profile
): Promise<ScoredResult[]> {
  if (jobs.length === 0) return [];

  const jobList = jobs
    .map(
      (j, i) =>
        `[${i}] Title: ${j.title}\nCompany: ${j.company}\nLocation: ${
          j.location || "n/a"
        }\nSalary: ${j.salary || "n/a"}\nDescription: ${(j.description || "").slice(0, 800)}`
    )
    .join("\n\n");

  const user = `${profileBlock(profile)}\n\nJobs to score:\n${jobList}`;

  const raw = await completeJson<any[]>({
    system: SYSTEM,
    user,
    maxTokens: 2500,
  });

  return raw.map((r, i) => ({
    index: typeof r.index === "number" ? r.index : i,
    ai_driven_score: clamp(r.ai_driven),
    ai_resist_score: clamp(r.ai_resist),
    match_score: clamp(r.match),
    reason: String(r.reason || "").slice(0, 280),
  }));
}

function clamp(n: unknown): number {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}
