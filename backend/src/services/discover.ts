import { config } from "../config";
import { Discovery, RawJob } from "../types";
import {
  getProfile,
  existingExternalIds,
  insertDiscovery,
  listDiscoveries,
} from "../repo";
import { fetchAllSources } from "./sources";
import { scoreJobs } from "./scoring";
import { sendDigest } from "./digest";

const MAX_TO_SCORE = 45; // cap Claude usage per run
const SCORE_BATCH = 9;
const MATCH_THRESHOLD = 55; // keep matches at/above this score
const MIN_KEEP = 8; // always keep at least the top few

export interface DiscoverRunResult {
  ranAt: string;
  fetched: number;
  bySource: Record<string, number | string>;
  newCandidates: number;
  scored: number;
  kept: number;
  emailed: boolean;
}

/** The full daily pipeline: fetch -> dedupe vs DB -> score -> store -> email. */
export async function runDiscovery(): Promise<DiscoverRunResult> {
  const ranAt = new Date().toISOString();
  const profile = getProfile();
  const terms = (profile.keywords || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const report = await fetchAllSources(terms);

  // Drop jobs we've already surfaced before.
  const known = existingExternalIds();
  let candidates = report.jobs.filter(
    (j) => !known.has(`${j.source}:${j.external_id}`)
  );

  // Light pre-filter: keep ones that look remote (these sources are remote-first).
  candidates = candidates.filter(isLikelyRemote);

  const newCandidates = candidates.length;
  const toScore = candidates.slice(0, MAX_TO_SCORE);

  let kept = 0;
  const keptDiscoveries: Discovery[] = [];

  if (config.hasAnthropic() && toScore.length > 0) {
    const scoredAll: Array<RawJob & {
      ai: number;
      resist: number;
      match: number;
      reason: string;
    }> = [];

    for (let i = 0; i < toScore.length; i += SCORE_BATCH) {
      const batch = toScore.slice(i, i + SCORE_BATCH);
      try {
        const scores = await scoreJobs(batch, profile);
        scores.forEach((s) => {
          const job = batch[s.index] ?? batch[0];
          scoredAll.push({
            ...job,
            ai: s.ai_driven_score,
            resist: s.ai_resist_score,
            match: s.match_score,
            reason: s.reason,
          });
        });
      } catch (err) {
        // If a batch fails, store unscored so they still surface.
        batch.forEach((job) =>
          scoredAll.push({ ...job, ai: 0, resist: 0, match: 0, reason: "" })
        );
      }
    }

    scoredAll.sort((a, b) => b.match - a.match);
    const keepers = scoredAll.filter((j, idx) => j.match >= MATCH_THRESHOLD || idx < MIN_KEEP);

    for (const j of keepers) {
      insertDiscovery({
        source: j.source,
        external_id: j.external_id,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.url,
        description: j.description,
        salary: j.salary,
        ai_driven_score: j.ai,
        ai_resist_score: j.resist,
        match_score: j.match,
        reason: j.reason || null,
        state: "new",
      });
      kept++;
    }
  } else {
    // No AI key: store candidates unscored so the inbox still fills.
    for (const j of toScore.slice(0, 20)) {
      insertDiscovery({
        source: j.source,
        external_id: j.external_id,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.url,
        description: j.description,
        salary: j.salary,
        ai_driven_score: null,
        ai_resist_score: null,
        match_score: null,
        reason: null,
        state: "new",
      });
      kept++;
    }
  }

  // Email the freshest "new" matches.
  const freshNew = listDiscoveries("new").slice(0, 15);
  let emailed = false;
  try {
    emailed = await sendDigest(freshNew);
  } catch {
    emailed = false;
  }

  return {
    ranAt,
    fetched: report.fetched,
    bySource: report.bySource,
    newCandidates,
    scored: toScore.length,
    kept,
    emailed,
  };
}

function isLikelyRemote(j: RawJob): boolean {
  const loc = (j.location || "").toLowerCase();
  if (j.source === "remotive" || j.source === "remoteok") return true; // remote-first boards
  return loc.includes("remote") || loc.includes("anywhere") || loc === "";
}
