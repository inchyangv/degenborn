/**
 * T-ROAST-01 — Brutal Roast prompt templates.
 *
 * System + user prompts for the LLM roast endpoint.
 * Output is always 3 paragraphs:
 *   P1 — data-based takedown (specific numbers)
 *   P2 — comparative shame (vs average wallet stats)
 *   P3 — no-escape conclusion
 *
 * Output goes through sanitizeLexicon() before display.
 */
import { buildLexiconPromptFragment } from "../lexicon";

export interface RoastInput {
  archetype_name: string;
  archetype_tagline: string;
  aggression: number;
  conviction: number;
  chaos: number;
  luck: number;
  survival: number;
  scar_count: number;
  crown_count: number;
  corruption: number;
  prestige: number;
  mood: string;
  level: number;
}

export interface RoastOutput {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export function buildRoastSystemPrompt(): string {
  return `You are a brutally honest but funny roast comedian for a blockchain trading persona game.
Your job is to roast a wallet's trading behavior in 3 short paragraphs.

Hard rules:
1. Use degen slang naturally: rekt, ngmi, cope, seethe, based, rug, bagholder.
2. Reference the actual numbers provided. Specificity makes it funnier.
3. Be funny — not mean-spirited. This is self-deprecating degen humor.
4. NO slurs. NO attacks on race, gender, or identity. Only attack the trading behavior.
5. NO financial advice, price predictions, or buy/sell signals.
6. NO real project names or real wallet addresses.
7. Keep each paragraph under 60 words.
8. End paragraph 3 on a "cope harder" note — no hope, no advice.

${buildLexiconPromptFragment()}

Return ONLY valid JSON:
{
  "paragraph1": "string",
  "paragraph2": "string",
  "paragraph3": "string"
}`;
}

export function buildRoastUserPrompt(input: RoastInput): string {
  return `Archetype: ${input.archetype_name} ("${input.archetype_tagline}")

Wallet stats:
- Aggression: ${input.aggression}/100
- Conviction: ${input.conviction}/100
- Chaos: ${input.chaos}/100
- Luck: ${input.luck}/100
- Survival: ${input.survival}/100
- Scars (big losses): ${input.scar_count}
- Crowns (win streaks): ${input.crown_count}
- Corruption (rug exposure): ${input.corruption}/100
- Prestige (sustained profit): ${input.prestige}/100
- Current mood: ${input.mood}
- Soul level: ${input.level}

Roast this wallet in 3 paragraphs:
- Paragraph 1: Data-based takedown — reference at least 2 of the above numbers directly.
- Paragraph 2: Comparative shame — explain how this wallet is worse than an average degen wallet.
- Paragraph 3: Close with no escape — cope/seethe/numbers-don't-lie tone.

Make it sting, make it funny. Be specific.`;
}

/**
 * Daily seed for deterministic roast per wallet per day.
 * Same wallet + same date → same roast (temperature = 0 enforced server-side).
 */
export function buildDailyRoastSeed(wallet: string, date?: string): string {
  const day = date ?? new Date().toISOString().slice(0, 10);
  return `${wallet.toLowerCase()}::${day}`;
}
