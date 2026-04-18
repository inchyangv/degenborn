/**
 * 5.4: Abuse Guard — wash trade and score manipulation detection.
 *
 * Detects patterns that inflate DNA scores artificially:
 * 1. Single counterparty repeat trades (same buy/sell partner > 3x)
 * 2. Immediate same-token re-entry (buy → sell → buy same token within 60s)
 * 3. Suspiciously perfect PnL pattern (all wins, no losses = synthetic activity)
 * 4. Round-number trades (exact $1000, $5000 values = scripted)
 *
 * Returns a flag + negative trait "suspicious_trader" if triggered.
 * Applies a 30% discount to Aggression and Luck scores for suspicious wallets.
 */

import type { ActivityEvent } from "@degenborn/shared";

export interface AbuseReport {
  is_suspicious: boolean;
  confidence: number;   // 0–100
  flags: AbuseFlag[];
  score_discount: number; // 0–1, multiply Aggression/Luck by (1 - discount)
  trait: "suspicious_trader" | null;
}

export type AbuseFlag =
  | "single_counterparty_repeat"   // same token bought/sold >3x in short window
  | "instant_roundtrip"            // buy→sell same token in <60s
  | "zero_loss_pattern"            // >95% of trades are wins
  | "round_number_trades";         // ≥50% of trades use suspiciously round USD values

function isRoundNumber(usd: number): boolean {
  if (usd === 0) return false;
  // Check if divisible by 100 with no remainder
  return usd >= 100 && usd % 100 === 0;
}

export function detectAbuse(events: ActivityEvent[]): AbuseReport {
  const flags: AbuseFlag[] = [];
  let confidence = 0;

  const trades = events.filter((e) => e.event_type === "buy" || e.event_type === "sell" || e.event_type === "rug");

  if (trades.length < 3) {
    return { is_suspicious: false, confidence: 0, flags: [], score_discount: 0, trait: null };
  }

  // Flag 1: Single-token repeat (same token >3x in <1 hour)
  const tokenBuckets = new Map<string, ActivityEvent[]>();
  for (const e of trades) {
    const key = e.token_address.toLowerCase();
    if (!tokenBuckets.has(key)) tokenBuckets.set(key, []);
    tokenBuckets.get(key)!.push(e);
  }
  for (const [, tokenEvents] of tokenBuckets) {
    if (tokenEvents.length < 4) continue;
    // Check if they all happened within 3600 seconds
    const sorted = [...tokenEvents].sort((a, b) => a.timestamp - b.timestamp);
    const span = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
    if (span < 3600 && tokenEvents.length >= 4) {
      flags.push("single_counterparty_repeat");
      confidence += 35;
      break;
    }
  }

  // Flag 2: Instant roundtrip (<60 seconds between buy and sell of same token)
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 0; i < sortedTrades.length - 1; i++) {
    const curr = sortedTrades[i];
    const next = sortedTrades[i + 1];
    if (
      curr.token_address === next.token_address &&
      curr.event_type === "buy" && next.event_type === "sell" &&
      next.timestamp - curr.timestamp < 60
    ) {
      flags.push("instant_roundtrip");
      confidence += 40;
      break;
    }
  }

  // Flag 3: Zero-loss pattern
  const pnlEvents = trades.filter((e) => e.pnl_delta !== 0);
  if (pnlEvents.length >= 5) {
    const winCount = pnlEvents.filter((e) => e.pnl_delta > 0).length;
    const winRate = winCount / pnlEvents.length;
    if (winRate > 0.95) {
      flags.push("zero_loss_pattern");
      confidence += 25;
    }
  }

  // Flag 4: Round-number trades
  if (trades.length >= 5) {
    const roundCount = trades.filter((e) => isRoundNumber(e.value_usd)).length;
    if (roundCount / trades.length >= 0.5) {
      flags.push("round_number_trades");
      confidence += 20;
    }
  }

  const is_suspicious = confidence >= 35;
  const score_discount = is_suspicious ? Math.min(0.5, confidence / 100) : 0;

  return {
    is_suspicious,
    confidence: Math.min(100, confidence),
    flags,
    score_discount,
    trait: is_suspicious ? "suspicious_trader" : null,
  };
}

/** Apply abuse discount to DNA scores */
export function applyAbuseDiscount(
  dna: { aggression: number; luck: number },
  report: AbuseReport,
): { aggression: number; luck: number } {
  if (!report.is_suspicious) return dna;
  const factor = 1 - report.score_discount;
  return {
    aggression: Math.round(dna.aggression * factor),
    luck: Math.round(dna.luck * factor),
  };
}
