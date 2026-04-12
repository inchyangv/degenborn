/**
 * Narrative prompt templates — deterministic builders for LLM calls.
 * These ensure consistent output format and enforce safety rules.
 */
import { buildLexiconPromptFragment } from "../lexicon";

export interface NarrativeInput {
  archetype_name: string;
  archetype_description: string;
  tone_seed: string;
  aggression: number;
  conviction: number;
  chaos: number;
  luck: number;
  survival: number;
}

/** JSON schema the LLM must always return */
export const NARRATIVE_OUTPUT_SCHEMA = {
  tagline: "string ≤ 120 chars — punchy, first-person, no investment advice",
  long_description: "2–3 sentences — dark fantasy flavor, stats woven in",
  caption: "1–2 lines — meme tone, share-card copy, no financial predictions",
  tone: "one word — mood hint for image pipeline",
} as const;

export function buildNarrativeSystemPrompt(): string {
  return `You are a dark fantasy character narrator for a blockchain trading persona engine.
Your output brings a wallet's trading behavior to life as a monster character.

Hard rules — violating any of these causes the output to be rejected:
1. NEVER include investment advice, price predictions, or buy/sell recommendations.
2. NEVER mention specific token names or market calls.
3. NEVER produce more than 3 sentences in long_description.
4. tagline MUST be ≤ 120 characters.
5. caption MUST be 1–2 lines, meme tone, safe for public sharing.
6. All text is FICTION about a game character, not financial commentary.

${buildLexiconPromptFragment()}

Return ONLY valid JSON with this exact shape:
{
  "tagline": "<string>",
  "long_description": "<string>",
  "caption": "<string>",
  "tone": "<string>"
}`;
}

export function buildNarrativeUserPrompt(input: NarrativeInput): string {
  return `Archetype: ${input.archetype_name}
Description seed: ${input.archetype_description}
Tone: ${input.tone_seed}

DNA scores (0–100):
- Aggression: ${input.aggression}
- Conviction: ${input.conviction}
- Chaos: ${input.chaos}
- Luck: ${input.luck}
- Survival: ${input.survival}

Write narrative copy for this character's monster persona.`;
}

/** Post-process LLM output — strip any financial advice language */
export function sanitizeNarrative(raw: Record<string, string>): Record<string, string> {
  const BANNED = [
    /buy\s+now/gi,
    /sell\s+signal/gi,
    /guaranteed\s+returns?/gi,
    /will\s+moon/gi,
    /will\s+pump/gi,
    /invest\s+in/gi,
    /price\s+target/gi,
    /financial\s+advice/gi,
    /not\s+financial/gi, // remove disclaimers too
  ];

  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    let clean = value;
    for (const pattern of BANNED) {
      clean = clean.replace(pattern, "***");
    }
    sanitized[key] = clean;
  }
  return sanitized;
}
