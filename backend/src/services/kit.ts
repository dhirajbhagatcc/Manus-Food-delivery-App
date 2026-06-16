import { complete } from "../anthropic";
import { Job, KitType, Profile } from "../types";

function jobBlock(job: Job): string {
  return `Role: ${job.title}
Company: ${job.company || "Unknown"}
Location: ${job.location || "n/a"}
Salary: ${job.salary || "n/a"}
Job description / notes:
"""
${job.description || "(no description provided)"}
"""`;
}

function resumeBlock(p: Profile): string {
  return `Candidate: ${p.full_name || "the candidate"}
Resume:
"""
${p.resume_text || "(no resume on file)"}
"""`;
}

const PROMPTS: Record<KitType, { system: string; instruction: string; maxTokens: number }> = {
  cover_letter: {
    system:
      "You are an expert career writer. Write a concise, specific, confident cover letter. " +
      "Avoid clichés and generic filler. Use concrete achievements from the resume that map " +
      "to the role. 3-4 short paragraphs. Plain text, ready to send.",
    instruction:
      "Write a tailored cover letter for this role using the candidate's real experience.",
    maxTokens: 1100,
  },
  resume_bullets: {
    system:
      "You are a resume optimization expert. Rewrite resume bullet points so they are tailored " +
      "to the target role: lead with impact, quantify results, mirror the role's key requirements " +
      "and keywords honestly (never fabricate). Return 5-8 bullets as a markdown list.",
    instruction:
      "Rewrite the most relevant resume bullets so they're tailored to this specific role.",
    maxTokens: 900,
  },
  interview_questions: {
    system:
      "You are an experienced hiring manager. Produce five likely interview questions for this " +
      "role and candidate, mixing behavioral, role-specific, and one tough/curveball question. " +
      "For each, add a one-line tip on what a strong answer covers. Return a numbered markdown list.",
    instruction:
      "Generate the five most likely interview questions for this role, with answer tips.",
    maxTokens: 900,
  },
  company_brief: {
    system:
      "You are a research analyst. Produce a crisp one-page company brief to help a candidate " +
      "prepare. Use clear markdown sections: Overview, What they do, Likely priorities, " +
      "Why this role exists, Smart questions to ask, and Talking points connecting the candidate. " +
      "If you are unsure of a fact, mark it as an assumption rather than inventing specifics.",
    instruction:
      "Write a one-page company brief to help the candidate prepare for this opportunity.",
    maxTokens: 1300,
  },
};

export async function generateKitPiece(
  type: KitType,
  job: Job,
  profile: Profile
): Promise<string> {
  const p = PROMPTS[type];
  const user = `${p.instruction}\n\n${jobBlock(job)}\n\n${resumeBlock(profile)}`;
  return complete({
    system: p.system,
    user,
    maxTokens: p.maxTokens,
    temperature: 0.6,
  });
}
