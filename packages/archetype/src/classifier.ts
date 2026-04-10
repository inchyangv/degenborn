import type { PersonaDNA, ArchetypeId, ArchetypeResult } from "@degenborn/shared";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";

type Threshold = "high" | "mid" | "low";

/**
 * Classify a score:
 *  high  ≥ 65
 *  mid   35–64
 *  low   < 35
 */
function classify_score(score: number): Threshold {
  if (score >= 65) return "high";
  if (score >= 35) return "mid";
  return "low";
}

interface Rule {
  archetype: ArchetypeId;
  /** returns a confidence weight if the rule matches, 0 otherwise */
  match: (dna: PersonaDNA) => number;
}

/**
 * Rule set — deterministic, order matters only for tie-breaking.
 *
 * Tie-breaker policy (documented):
 *  When two rules have equal confidence, the rule appearing first in this array wins.
 *  Order: rug_necromancer > mad_gambler > ice_whale > sniper_jester > diamond_cultist > ghost_bagholder
 *
 * Each match() returns a weight in [0, 1].
 * Final archetype = argmax over all rules.
 */
const RULES: Rule[] = [
  {
    archetype: "rug_necromancer",
    match: (dna) => {
      const c = classify_score(dna.chaos);
      const s = classify_score(dna.survival);
      if (c === "high" && s === "high") return 1.0;
      if (c === "high" && s === "mid") return 0.7;
      if (c === "mid" && s === "high") return 0.6;
      return 0;
    },
  },
  {
    archetype: "mad_gambler",
    match: (dna) => {
      const a = classify_score(dna.aggression);
      const c = classify_score(dna.chaos);
      const l = classify_score(dna.luck);
      if (a === "high" && c === "high" && l !== "high") return 1.0;
      if (a === "high" && c === "high") return 0.8;
      if (a === "high" && c === "mid") return 0.6;
      return 0;
    },
  },
  {
    archetype: "ice_whale",
    match: (dna) => {
      const conv = classify_score(dna.conviction);
      const l = classify_score(dna.luck);
      const s = classify_score(dna.survival);
      if (conv === "high" && l === "high" && s === "high") return 1.0;
      if (conv === "high" && l === "high") return 0.85;
      if (conv === "high" && s === "high") return 0.7;
      return 0;
    },
  },
  {
    archetype: "sniper_jester",
    match: (dna) => {
      const a = classify_score(dna.aggression);
      const l = classify_score(dna.luck);
      if (a === "high" && l === "high") return 1.0;
      if (a === "mid" && l === "high") return 0.75;
      return 0;
    },
  },
  {
    archetype: "diamond_cultist",
    match: (dna) => {
      const conv = classify_score(dna.conviction);
      const l = classify_score(dna.luck);
      const s = classify_score(dna.survival);
      if (conv === "high" && l === "low" && s === "high") return 1.0;
      if (conv === "high" && l === "low") return 0.8;
      if (conv === "high" && l === "mid" && s === "high") return 0.6;
      return 0;
    },
  },
  {
    archetype: "ghost_bagholder",
    match: (dna) => {
      const conv = classify_score(dna.conviction);
      const c = classify_score(dna.chaos);
      const s = classify_score(dna.survival);
      if (conv === "high" && c === "high" && s === "low") return 1.0;
      if (conv === "high" && s === "low") return 0.7;
      if (c === "high" && s === "low") return 0.6;
      return 0;
    },
  },
];

/** Fallback when no rule scores above 0 — pick by highest raw score */
function fallback(dna: PersonaDNA): ArchetypeId {
  const scores: [ArchetypeId, number][] = [
    ["mad_gambler", dna.aggression + dna.chaos],
    ["ice_whale", dna.conviction + dna.luck],
    ["rug_necromancer", dna.chaos + dna.survival],
    ["diamond_cultist", dna.conviction + dna.survival],
    ["sniper_jester", dna.aggression + dna.luck],
    ["ghost_bagholder", dna.conviction + dna.chaos - dna.survival],
  ];
  return scores.reduce((best, cur) => (cur[1] > best[1] ? cur : best), scores[0]!)[0];
}

export function classify(dna: PersonaDNA): ArchetypeResult {
  let best: { archetype: ArchetypeId; confidence: number } | null = null;
  let runnerUp: { archetype: ArchetypeId; confidence: number } | null = null;

  for (const rule of RULES) {
    const confidence = rule.match(dna);
    if (confidence > 0) {
      if (!best || confidence > best.confidence) {
        runnerUp = best;
        best = { archetype: rule.archetype, confidence };
      } else if (!runnerUp || confidence > runnerUp.confidence) {
        runnerUp = { archetype: rule.archetype, confidence };
      }
    }
  }

  const archetype: ArchetypeId = best ? best.archetype : fallback(dna);
  const confidence = best ? best.confidence : 0.3; // low confidence for fallback

  return {
    wallet_address: dna.wallet_address,
    archetype,
    profile: ARCHETYPE_PROFILES[archetype],
    confidence,
    runner_up: runnerUp?.archetype,
  };
}
