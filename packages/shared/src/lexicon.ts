/**
 * Degen Lexicon — brand voice and content safety guide.
 *
 * OK words: authentic degen culture vocabulary.
 * Avoid words: financial advice, offensive language, pump-and-dump tone.
 * Banned patterns: regex-matched phrases that must never appear in generated text.
 */

/** Words/phrases that are on-brand and encouraged in captions/dialogue */
export const DEGEN_OK_WORDS: string[] = [
  "rekt",
  "ngmi",
  "wagmi",
  "cope",
  "seethe",
  "based",
  "rug",
  "farm",
  "gm",
  "gn",
  "diamond hands",
  "paper hands",
  "ape",
  "moonshot",
  "flatline",
  "chad",
  "ser",
  "fren",
  "anon",
  "degen",
  "hodl",
  "fud",
  "fomo",
  "nfa",
  "dyor",
  "alpha",
  "rugged",
  "bagholder",
  "maxi",
  "floor price",
  "cope harder",
  "touch grass",
  "stay poor",
  "wen moon",
  "send it",
  "ngmi energy",
  "cope arc",
  "rug pull",
  "zombie wallet",
  "revival arc",
  "gm gm",
  "ser this",
];

/**
 * Words/phrases to avoid — not hard-banned but should not appear in output.
 * Used as soft guidance in LLM prompts.
 */
export const DEGEN_AVOID_WORDS: string[] = [
  // Financial advice tone
  "buy this",
  "sell now",
  "100x guaranteed",
  "sure profit",
  "safe investment",
  "guaranteed gains",
  "risk-free",
  "financial advice",
  "do your own research and buy",
  "this will moon",
  "this will pump",
  // Corporate/bland Web3 speak
  "enhance your Web3 experience",
  "revolutionizing the blockchain",
  "next-generation NFT platform",
  "synergistic tokenomics",
  "utility-driven",
  "building the future",
  // Offensive
  "retard",
  "spastic",
];

/**
 * Hard-banned regex patterns.
 * Any generated text matching these must be rejected or re-generated.
 */
export const DEGEN_BANNED_PATTERNS: RegExp[] = [
  /\b(buy|sell)\s+signal\b/gi,
  /guaranteed\s+(returns?|profit|gains?|money|\d+x)/gi,
  /\d+x\s+guaranteed/gi,
  /will\s+(moon|pump|10x|100x)\b/gi,
  /invest\s+in\b/gi,
  /\bfinancial\s+advice\b/gi,
  /\bprice\s+target\b/gi,
  /not\s+financial\s+advice/gi, // disclaimers are also off-brand noise
];

/**
 * Check text against the banned pattern list.
 * Returns { ok: true } if clean, { ok: false, violations: [...] } if dirty.
 */
export function checkLexicon(text: string): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const pattern of DEGEN_BANNED_PATTERNS) {
    const cloned = new RegExp(pattern.source, pattern.flags);
    const matches = text.match(cloned);
    if (matches) violations.push(...matches);
  }
  return { ok: violations.length === 0, violations };
}

/**
 * Strip banned patterns from text, replacing with "***".
 * Use as a last-resort sanitizer before displaying LLM output.
 */
export function sanitizeLexicon(text: string): string {
  let result = text;
  for (const pattern of DEGEN_BANNED_PATTERNS) {
    result = result.replace(pattern, "***");
  }
  return result;
}

/**
 * System-prompt fragment injected into all LLM calls.
 * Paste this into your system prompt to enforce brand voice.
 */
export function buildLexiconPromptFragment(): string {
  return `
Brand voice rules (HARD):
- NEVER write investment advice, price predictions, or buy/sell signals.
- NEVER write "guaranteed returns", "will moon", "will pump", or similar hype phrases.
- NEVER mention specific token tickers or price targets.
- Write in authentic degen/crypto culture voice: rekt, ngmi, wagmi, cope, based, rug, gm/gn are all fine.
- Avoid corporate Web3 buzzwords: "revolutionizing", "synergistic", "utility-driven", "next-generation".
- All text is fiction about a game character — never financial commentary.`.trim();
}
