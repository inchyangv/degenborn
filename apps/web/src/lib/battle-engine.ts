/**
 * T-DRMA-01 — Soul Battle (1v1 Deterministic PvP)
 *
 * All results are deterministic: same pair of wallets → same outcome every time.
 * Uses djb2 hash for seeding, archetype counter table, and DNA axis comparison.
 */
import type { ArchetypeId } from "@degenborn/shared";
import { DIALOGUE_BANK } from "@degenborn/shared";

// ── djb2 hash ────────────────────────────────────────────────────────────────
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]!;
}

// ── Archetype counter table (6-way rock-paper-scissors) ───────────────────
/** Returns true if `a` counters `b` */
const COUNTER_MAP: Partial<Record<ArchetypeId, ArchetypeId>> = {
  mad_gambler: "diamond_cultist",
  ice_whale: "mad_gambler",
  rug_necromancer: "ice_whale",
  sniper_jester: "rug_necromancer",
  ghost_bagholder: "sniper_jester",
  diamond_cultist: "ghost_bagholder",
};

function counters(a: ArchetypeId, b: ArchetypeId): boolean {
  return COUNTER_MAP[a] === b;
}

// ── Round event types ─────────────────────────────────────────────────────
export type BattleRoundResult = "A_WINS" | "B_WINS" | "DRAW";

export interface BattleRound {
  round: number;
  result: BattleRoundResult;
  /** Dialogue line from soul A */
  dialogue_a: { en: string; ko: string };
  /** Dialogue line from soul B */
  dialogue_b: { en: string; ko: string };
  /** Short human-readable description */
  description: string;
}

export interface BattleSoulInput {
  wallet: string;
  archetype: ArchetypeId;
  name: string;
  /** DNA axes 0-100 */
  dna: {
    aggression: number;
    conviction: number;
    chaos: number;
    luck: number;
    survival: number;
  };
  level: number;
}

export interface BattleResult {
  winner: "A" | "B" | "DRAW";
  rounds: BattleRound[];
  /** 0-3 score for each side */
  score_a: number;
  score_b: number;
  /** Flavour text summary */
  summary_en: string;
  summary_ko: string;
}

// ── Round resolution ──────────────────────────────────────────────────────

type DialogueEventKey =
  | "first_win"
  | "big_loss"
  | "rug_event"
  | "recovery"
  | "level_up"
  | "idle";

function roundDialogue(
  archetype: ArchetypeId,
  event: DialogueEventKey,
  seed: number
): { en: string; ko: string } {
  const bank = DIALOGUE_BANK[archetype]?.[event];
  if (!bank || bank.length === 0) return { en: "...", ko: "..." };
  return pick(bank, seed);
}

const ROUND_EVENTS: DialogueEventKey[] = [
  "first_win",
  "rug_event",
  "recovery",
  "big_loss",
  "level_up",
  "idle",
];

function resolveRound(
  a: BattleSoulInput,
  b: BattleSoulInput,
  round: number,
  baseSeed: number
): BattleRound {
  const roundSeed = djb2(`${baseSeed}:${round}`);

  // Score each fighter for this round using a mix of stats
  // Round 1: Aggression duel  Round 2: Survival duel  Round 3: Luck + archetype counter
  let scoreA: number;
  let scoreB: number;
  let description: string;

  if (round === 0) {
    scoreA = a.dna.aggression + (a.dna.aggression > a.dna.conviction ? 10 : 0);
    scoreB = b.dna.aggression + (b.dna.aggression > b.dna.conviction ? 10 : 0);
    description = "Aggression round — who fires first?";
  } else if (round === 1) {
    scoreA = a.dna.survival + (a.dna.survival > a.dna.chaos ? 10 : 0);
    scoreB = b.dna.survival + (b.dna.survival > b.dna.chaos ? 10 : 0);
    description = "Survival round — who holds on?";
  } else {
    scoreA = a.dna.luck + (counters(a.archetype, b.archetype) ? 25 : 0) + a.level * 2;
    scoreB = b.dna.luck + (counters(b.archetype, a.archetype) ? 25 : 0) + b.level * 2;
    description = "Final round — archetype counter decides";
  }

  // Add deterministic noise (±5)
  const noiseA = ((roundSeed + 7) % 11) - 5;
  const noiseB = ((roundSeed + 13) % 11) - 5;
  scoreA += noiseA;
  scoreB += noiseB;

  const result: BattleRoundResult =
    scoreA > scoreB ? "A_WINS" : scoreB > scoreA ? "B_WINS" : "DRAW";

  const eventA = ROUND_EVENTS[(roundSeed + 0) % ROUND_EVENTS.length]!;
  const eventB = ROUND_EVENTS[(roundSeed + 3) % ROUND_EVENTS.length]!;
  const dialogueSeedA = djb2(`${baseSeed}:a:${round}`);
  const dialogueSeedB = djb2(`${baseSeed}:b:${round}`);

  return {
    round: round + 1,
    result,
    dialogue_a: roundDialogue(a.archetype, eventA, dialogueSeedA),
    dialogue_b: roundDialogue(b.archetype, eventB, dialogueSeedB),
    description,
  };
}

// ── Summary templates ─────────────────────────────────────────────────────
const SUMMARIES: Array<{ en: string; ko: string }> = [
  { en: "The battle was never in question.", ko: "전투는 처음부터 결정나 있었다." },
  { en: "One soul stood. The other scattered.", ko: "하나의 소울은 서 있었다. 다른 하나는 흩어졌다." },
  { en: "A close fight — both souls scarred.", ko: "팽팽한 싸움 — 두 소울 모두 흉터가 남았다." },
  { en: "The counters aligned. Destiny runs the chain.", ko: "카운터가 맞아 떨어졌다. 운명이 체인을 달린다." },
  { en: "No rug could save you here.", ko: "여기선 러그도 당신을 구하지 못한다." },
  { en: "They called it chaos. It was precision.", ko: "그들은 카오스라 불렀다. 그건 정밀함이었다." },
];

const DRAW_SUMMARIES: Array<{ en: string; ko: string }> = [
  { en: "Two degens. One mirror.", ko: "두 디젠. 하나의 거울." },
  { en: "The chain couldn't decide either.", ko: "체인도 판단을 못했다." },
  { en: "Identical chaos. Identical scars.", ko: "동일한 카오스. 동일한 흉터." },
];

// ── Main export ───────────────────────────────────────────────────────────

/**
 * Run a 3-round deterministic battle between two souls.
 * Always produces the same result for the same pair of wallets.
 */
export function runBattle(a: BattleSoulInput, b: BattleSoulInput): BattleResult {
  // Canonical ordering: sort wallets so battle(a,b) === battle(b,a)
  const sortedWallets = [a.wallet.toLowerCase(), b.wallet.toLowerCase()].sort();
  const baseSeed = djb2(sortedWallets[0]! + "vs" + sortedWallets[1]!);

  const rounds: BattleRound[] = [
    resolveRound(a, b, 0, baseSeed),
    resolveRound(a, b, 1, baseSeed),
    resolveRound(a, b, 2, baseSeed),
  ];

  const score_a = rounds.filter((r) => r.result === "A_WINS").length;
  const score_b = rounds.filter((r) => r.result === "B_WINS").length;

  const winner: "A" | "B" | "DRAW" =
    score_a > score_b ? "A" : score_b > score_a ? "B" : "DRAW";

  const summarySeed = djb2(`${baseSeed}:summary`);
  const summary =
    winner === "DRAW"
      ? DRAW_SUMMARIES[summarySeed % DRAW_SUMMARIES.length]!
      : SUMMARIES[summarySeed % SUMMARIES.length]!;

  return {
    winner,
    rounds,
    score_a,
    score_b,
    summary_en: summary.en,
    summary_ko: summary.ko,
  };
}
