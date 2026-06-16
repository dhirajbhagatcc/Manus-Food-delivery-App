import { RawJob } from "../../types";
import { htmlToText } from "../html";

const ENDPOINT = "https://remotive.com/api/remote-jobs";

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  url: string;
  description: string;
  salary: string;
}

/** Fetch remote jobs from Remotive. Optional search filter. */
export async function fetchRemotive(search = ""): Promise<RawJob[]> {
  const url = `${ENDPOINT}?limit=80${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ApplyTrackBot/1.0" },
  });
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);
  const data = (await res.json()) as { jobs?: RemotiveJob[] };
  return (data.jobs || []).map((j) => ({
    source: "remotive",
    external_id: String(j.id),
    title: j.title,
    company: j.company_name || "",
    location: j.candidate_required_location || "Remote",
    url: j.url,
    description: htmlToText(j.description || "").slice(0, 2000),
    salary: j.salary?.trim() || null,
  }));
}
