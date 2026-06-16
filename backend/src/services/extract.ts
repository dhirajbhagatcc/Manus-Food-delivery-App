import { completeJson } from "../anthropic";
import { fetchPageText } from "./html";

export interface ExtractedJob {
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  description: string | null;
}

const SYSTEM = `You extract structured job posting data. You are given the raw text of a
job posting (scraped from a web page or pasted by the user). Return ONLY a JSON object with keys:
{
  "title": string,            // role title, e.g. "Senior Customer Success Manager"
  "company": string,          // hiring company name, "" if unknown
  "location": string | null,  // e.g. "Remote (US)", "London, UK", or null
  "salary": string | null,    // compensation as written, e.g. "$120k-$150k", or null if absent
  "description": string | null // a concise 3-6 sentence summary of the role & requirements
}
Do not invent a salary. If text is not a job posting, infer the best you can. Output JSON only.`;

/** Extract job fields from a pasted URL or raw text. */
export async function extractJob(input: {
  url?: string;
  text?: string;
}): Promise<ExtractedJob> {
  let source = (input.text || "").trim();
  let sourceUrl = (input.url || "").trim();

  if (!source && sourceUrl) {
    source = await fetchPageText(sourceUrl);
  }
  if (!source) {
    throw new Error("Provide either a job URL or pasted job text.");
  }

  const user = `${sourceUrl ? `Source URL: ${sourceUrl}\n\n` : ""}Job posting text:\n"""\n${source.slice(0, 12000)}\n"""`;

  const data = await completeJson<ExtractedJob>({
    system: SYSTEM,
    user,
    maxTokens: 1200,
  });

  return {
    title: data.title?.trim() || "Untitled role",
    company: data.company?.trim() || "",
    location: data.location?.trim() || null,
    salary: data.salary?.trim() || null,
    description: data.description?.trim() || null,
  };
}
