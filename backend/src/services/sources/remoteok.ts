import { RawJob } from "../../types";
import { htmlToText } from "../html";

const ENDPOINT = "https://remoteok.com/api";

interface RemoteOkJob {
  id?: string | number;
  slug?: string;
  position?: string;
  company?: string;
  location?: string;
  url?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  legal?: string; // present on the first metadata element
}

function salaryText(j: RemoteOkJob): string | null {
  if (j.salary_min && j.salary_max) return `$${j.salary_min} - $${j.salary_max}`;
  if (j.salary_min) return `from $${j.salary_min}`;
  return null;
}

/** Fetch remote jobs from RemoteOK. The first array element is a legal notice. */
export async function fetchRemoteOk(): Promise<RawJob[]> {
  const res = await fetch(ENDPOINT, {
    headers: {
      Accept: "application/json",
      // RemoteOK blocks requests without a browser-like UA.
      "User-Agent":
        "Mozilla/5.0 (compatible; ApplyTrackBot/1.0) Chrome/120 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`RemoteOK HTTP ${res.status}`);
  const data = (await res.json()) as RemoteOkJob[];
  return data
    .filter((j) => j && j.id && j.position)
    .map((j) => ({
      source: "remoteok",
      external_id: String(j.id),
      title: j.position || "",
      company: j.company || "",
      location: j.location || "Remote",
      url: j.url || (j.slug ? `https://remoteok.com/remote-jobs/${j.slug}` : ""),
      description: htmlToText(j.description || "").slice(0, 2000),
      salary: salaryText(j),
    }))
    .filter((j) => j.url);
}
