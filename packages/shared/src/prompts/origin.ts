/**
 * T-DRMA-02 — Origin Story prompt templates.
 *
 * System + user prompts for the LLM origin story endpoint.
 * Output is always 3 paragraphs, first-person past tense:
 *   P1 — where I came from (wallet origin)
 *   P2 — how I got rekt (scar events / low points)
 *   P3 — how I became what I am now (current state)
 *
 * Each paragraph ≤ 100 words.
 * Output goes through sanitizeLexicon() before display.
 */
import { buildLexiconPromptFragment } from "../lexicon";

export interface OriginInput {
  archetype_name: string;
  archetype_tagline: string;
  archetype_tone: string;
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

export interface OriginOutput {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
}

export function buildOriginSystemPrompt(): string {
  return `You are a darkly poetic storyteller writing the origin story of a blockchain trading soul.
Write in first person, past tense. The tone should match the archetype's character.
Think: gothic trading memoir meets degen culture.

Hard rules:
1. First person only ("I", "my", "me").
2. Past tense narrative.
3. Each paragraph must be under 100 words.
4. Use degen vocabulary naturally: rug, rekt, bagholder, conviction, cope, scar, crown.
5. No financial advice, no price predictions.
6. No real wallet addresses or real project names.
7. The writing should feel like an old book entry — gravitas, scars, identity.
8. Do NOT be funny. This is the serious counterpart to the roast.

${buildLexiconPromptFragment()}

Return ONLY valid JSON:
{
  "paragraph1": "string",
  "paragraph2": "string",
  "paragraph3": "string"
}`;
}

export function buildOriginUserPrompt(input: OriginInput): string {
  return `Archetype: ${input.archetype_name} ("${input.archetype_tagline}")
Tone seed: ${input.archetype_tone}

Soul stats:
- Aggression: ${input.aggression}/100
- Conviction: ${input.conviction}/100
- Chaos: ${input.chaos}/100
- Luck: ${input.luck}/100
- Survival: ${input.survival}/100
- Scars (major losses): ${input.scar_count}
- Crowns (win streaks): ${input.crown_count}
- Corruption (rug exposure): ${input.corruption}/100
- Prestige (sustained gains): ${input.prestige}/100
- Current mood: ${input.mood}
- Soul level: ${input.level}

Write the origin story in 3 paragraphs:
- Paragraph 1: Where I came from — describe the soul's first encounter with the chain.
  Why did I enter? What did I believe? (≤100 words)
- Paragraph 2: How I was broken — reference the scars, the rugs, the low points.
  The moment conviction was tested. (≤100 words, at least 1 direct reference to scar_count or corruption)
- Paragraph 3: How I became this — what remains after all of it.
  The current archetype identity, the mood, the shape of the soul now. (≤100 words)

Use the tone seed as your voice guide. Be literary. Make it sting in a different way than a roast.`;
}

/**
 * Cache key for origin story — same wallet always gets same story.
 */
export function buildOriginCacheKey(wallet: string): string {
  return `origin::${wallet.toLowerCase()}`;
}
