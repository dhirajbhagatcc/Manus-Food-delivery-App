import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!config.hasAnthropic()) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment to use AI features."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

interface CompleteOpts {
  system?: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/** Run a single-turn completion and return the concatenated text. */
export async function complete(opts: CompleteOpts): Promise<string> {
  const c = getClient();
  const msg = await c.messages.create({
    model: config.anthropicModel,
    max_tokens: opts.maxTokens ?? 1500,
    temperature: opts.temperature ?? 0.4,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/**
 * Run a completion expected to return JSON. Strips markdown fences and parses.
 * Throws if the response cannot be parsed.
 */
export async function completeJson<T = unknown>(opts: CompleteOpts): Promise<T> {
  const raw = await complete({ ...opts, temperature: opts.temperature ?? 0 });
  return parseJson<T>(raw);
}

export function parseJson<T = unknown>(raw: string): T {
  let text = raw.trim();
  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // Fall back to slicing between the first { or [ and the matching last bracket.
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const start =
      firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr);
    if (start >= 0) {
      const lastObj = text.lastIndexOf("}");
      const lastArr = text.lastIndexOf("]");
      const end = Math.max(lastObj, lastArr);
      if (end > start) text = text.slice(start, end + 1);
    }
  }
  return JSON.parse(text) as T;
}
