import { RawJob } from "../../types";
import { fetchRemotive } from "./remotive";
import { fetchRemoteOk } from "./remoteok";
import { fetchAdzuna } from "./adzuna";

export interface SourceReport {
  fetched: number;
  bySource: Record<string, number | string>;
  jobs: RawJob[];
}

/**
 * Pull from all configured sources, tolerating individual failures.
 * `terms` are optional search hints derived from the profile keywords.
 */
export async function fetchAllSources(terms: string[] = []): Promise<SourceReport> {
  const search = terms.join(" ").slice(0, 60);
  const bySource: Record<string, number | string> = {};

  const tasks: Array<Promise<RawJob[]>> = [
    wrap("remotive", () => fetchRemotive(search), bySource),
    wrap("remoteok", () => fetchRemoteOk(), bySource),
    wrap("adzuna", () => fetchAdzuna(search || "remote"), bySource),
  ];

  const results = await Promise.all(tasks);
  const jobs = dedupe(results.flat());

  return { fetched: jobs.length, bySource, jobs };
}

async function wrap(
  name: string,
  fn: () => Promise<RawJob[]>,
  bySource: Record<string, number | string>
): Promise<RawJob[]> {
  try {
    const jobs = await fn();
    bySource[name] = jobs.length;
    return jobs;
  } catch (err) {
    bySource[name] = `error: ${(err as Error).message}`;
    return [];
  }
}

/** Remove duplicates by source+id and by normalized url. */
function dedupe(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>();
  const out: RawJob[] = [];
  for (const j of jobs) {
    const keyId = `${j.source}:${j.external_id}`;
    const keyUrl = (j.url || "").split("?")[0].toLowerCase();
    if (seen.has(keyId) || (keyUrl && seen.has(keyUrl))) continue;
    seen.add(keyId);
    if (keyUrl) seen.add(keyUrl);
    out.push(j);
  }
  return out;
}
