import { config } from "../../config";
import { RawJob } from "../../types";
import { htmlToText } from "../html";

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  redirect_url: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
}

function salaryText(j: AdzunaJob): string | null {
  if (j.salary_min && j.salary_max)
    return `${Math.round(j.salary_min)} - ${Math.round(j.salary_max)}`;
  if (j.salary_min) return `from ${Math.round(j.salary_min)}`;
  return null;
}

/**
 * Fetch jobs from Adzuna for a set of countries. Requires ADZUNA_APP_ID/KEY.
 * Adzuna has no global "remote" flag, so we search the term "remote".
 */
export async function fetchAdzuna(
  search = "remote",
  countries = ["us", "gb"]
): Promise<RawJob[]> {
  if (!config.hasAdzuna()) return [];
  const all: RawJob[] = [];

  for (const country of countries) {
    const url =
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
      `?app_id=${config.adzunaAppId}&app_key=${config.adzunaKey}` +
      `&results_per_page=40&what=${encodeURIComponent(search)}` +
      `&content-type=application/json`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const data = (await res.json()) as { results?: AdzunaJob[] };
      for (const j of data.results || []) {
        all.push({
          source: "adzuna",
          external_id: `${country}:${j.id}`,
          title: j.title,
          company: j.company?.display_name || "",
          location: j.location?.display_name || country.toUpperCase(),
          url: j.redirect_url,
          description: htmlToText(j.description || "").slice(0, 2000),
          salary: salaryText(j),
        });
      }
    } catch {
      // Skip a failing country, keep going.
    }
  }
  return all;
}
