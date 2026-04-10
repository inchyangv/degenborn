import type { ActivityEvent, PersonaDNA } from "@degenborn/shared";

export interface ScoringResult {
  dna: PersonaDNA;
  debug: {
    aggression_raw: number;
    conviction_raw: number;
    chaos_raw: number;
    luck_raw: number;
    survival_raw: number;
  };
}

/** Clamp value between 0 and 100 */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/** Linear normalisation: maps raw ∈ [0, cap] → [0, 100] */
function norm(raw: number, cap: number): number {
  if (cap === 0) return 0;
  return clamp((raw / cap) * 100);
}

/**
 * Compute Aggression score (0–100)
 *
 * Inputs:
 *  - trading frequency (events per day)
 *  - fraction of trades with short hold (< 3600 s)
 *  - re-entry rate on same token within 24 h
 */
function scoreAggression(events: ActivityEvent[]): number {
  if (events.length === 0) return 0;

  const trades = events.filter((e) => e.event_type === "buy" || e.event_type === "sell");
  if (trades.length === 0) return 0;

  const timestamps = trades.map((e) => e.timestamp).sort((a, b) => a - b);
  const spanDays = Math.max(1, (timestamps[timestamps.length - 1]! - timestamps[0]!) / 86400);
  const freqPerDay = trades.length / spanDays;

  // short-hold fraction: buys with hold_duration < 1 hour
  const buys = events.filter((e) => e.event_type === "buy");
  const shortHolds = buys.filter((e) => (e.hold_duration_seconds ?? Infinity) < 3600);
  const shortHoldFrac = buys.length > 0 ? shortHolds.length / buys.length : 0;

  // re-entry: same token bought within 24 h of selling
  const sells = events.filter((e) => e.event_type === "sell");
  const reEntryCount = sells.filter((sell) => {
    return buys.some(
      (buy) =>
        buy.token_address === sell.token_address &&
        Math.abs(buy.timestamp - sell.timestamp) < 86400,
    );
  }).length;
  const reEntryFrac = sells.length > 0 ? reEntryCount / sells.length : 0;

  // Weighted formula
  const raw = freqPerDay * 0.5 + shortHoldFrac * 30 + reEntryFrac * 20;
  // Cap freqPerDay contribution — 20 trades/day → full score
  return clamp(Math.round(norm(freqPerDay, 20) * 0.5 + shortHoldFrac * 30 + reEntryFrac * 20));
}

/**
 * Compute Conviction score (0–100)
 *
 * Inputs:
 *  - average hold duration (seconds) for sells
 *  - token concentration (top 3 tokens / total traded)
 *  - same-token re-entry ratio
 */
function scoreConviction(events: ActivityEvent[]): number {
  if (events.length === 0) return 0;

  const sells = events.filter((e) => e.event_type === "sell" && e.hold_duration_seconds != null);
  const avgHold =
    sells.length > 0
      ? sells.reduce((sum, e) => sum + (e.hold_duration_seconds ?? 0), 0) / sells.length
      : 0;
  // 7 days = 604800 s → 100
  const holdScore = norm(avgHold, 604800) * 40;

  const tokenCounts: Record<string, number> = {};
  events.forEach((e) => {
    tokenCounts[e.token_address] = (tokenCounts[e.token_address] ?? 0) + 1;
  });
  const sorted = Object.values(tokenCounts).sort((a, b) => b - a);
  const top3 = sorted.slice(0, 3).reduce((s, n) => s + n, 0);
  const concentration = events.length > 0 ? top3 / events.length : 0;
  const concScore = concentration * 40;

  // same-token repeat buy (already counted above as re-entry but from conviction POV)
  const buys = events.filter((e) => e.event_type === "buy");
  const repeatBuys = buys.filter((buy) => {
    return buys.some((b) => b !== buy && b.token_address === buy.token_address);
  }).length;
  const repeatScore = buys.length > 0 ? (repeatBuys / buys.length) * 20 : 0;

  return clamp(Math.round(holdScore + concScore + repeatScore));
}

/**
 * Compute Chaos score (0–100)
 *
 * Inputs:
 *  - PnL volatility (std dev)
 *  - rug event fraction
 *  - dead token exposure
 */
function scoreChaos(events: ActivityEvent[]): number {
  if (events.length === 0) return 0;

  const pnls = events.map((e) => e.pnl_delta).filter((v) => v !== 0);
  let volatilityScore = 0;
  if (pnls.length > 1) {
    const mean = pnls.reduce((s, v) => s + v, 0) / pnls.length;
    const variance = pnls.reduce((s, v) => s + (v - mean) ** 2, 0) / pnls.length;
    const stdDev = Math.sqrt(variance);
    // $1000 std dev → cap
    volatilityScore = norm(stdDev, 1000) * 40;
  }

  const rugEvents = events.filter((e) => e.event_type === "rug").length;
  const rugScore = norm(rugEvents, 5) * 40; // 5 rugs → full rug score

  const bigLosses = events.filter((e) => e.pnl_delta < -500).length;
  const lossScore = norm(bigLosses, 10) * 20;

  return clamp(Math.round(volatilityScore + rugScore + lossScore));
}

/**
 * Compute Luck score (0–100)
 *
 * Inputs:
 *  - profit-realization rate (sells with positive pnl / total sells)
 *  - early entry bonus (bought within first 10% of token lifespan)
 *  - exit accuracy (sold within top 20% of token peak)
 */
function scoreLuck(events: ActivityEvent[]): number {
  if (events.length === 0) return 0;

  const sells = events.filter((e) => e.event_type === "sell");
  if (sells.length === 0) return 30; // neutral default

  const profitableSells = sells.filter((e) => e.pnl_delta > 0).length;
  const profitRate = profitableSells / sells.length;
  const profitScore = profitRate * 60;

  // Estimate early entry from raw payload or hold duration
  const buys = events.filter((e) => e.event_type === "buy");
  const earlyEntries = buys.filter((b) => (b.hold_duration_seconds ?? 0) > 86400 * 3).length; // held ≥ 3 days suggests early
  const earlyScore = buys.length > 0 ? (earlyEntries / buys.length) * 20 : 0;

  // Big wins (recovery events with high pnl)
  const bigWins = events.filter((e) => e.pnl_delta > 1000).length;
  const bigWinScore = norm(bigWins, 5) * 20;

  return clamp(Math.round(profitScore + earlyScore + bigWinScore));
}

/**
 * Compute Survival score (0–100)
 *
 * Inputs:
 *  - recovery events (profit after rug/loss)
 *  - drawdown recovery rate
 *  - continued activity after big loss
 */
function scoreSurvival(events: ActivityEvent[]): number {
  if (events.length === 0) return 0;

  const recoveryEvents = events.filter((e) => e.event_type === "recovery").length;
  const recoveryScore = norm(recoveryEvents, 5) * 40;

  // Simulate comeback: loss followed by profit within 7 days
  let comebacks = 0;
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i]!;
    if (current.pnl_delta < -200) {
      const next7d = sortedEvents.slice(i + 1).find(
        (e) => e.timestamp - current.timestamp <= 604800 && e.pnl_delta > 0,
      );
      if (next7d) comebacks++;
    }
  }
  const comebackScore = norm(comebacks, 5) * 40;

  // Continued trading after big loss
  const bigLossIdxs = sortedEvents
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.pnl_delta < -500);
  let continuedAfterLoss = 0;
  for (const { i } of bigLossIdxs) {
    if (sortedEvents[i + 1]) continuedAfterLoss++;
  }
  const persistenceScore = norm(continuedAfterLoss, bigLossIdxs.length || 1) * 20;

  return clamp(Math.round(recoveryScore + comebackScore + persistenceScore));
}

/**
 * Main scoring entry point.
 * Deterministic — same events → same DNA.
 */
export function scoreDNA(
  wallet_address: string,
  events: ActivityEvent[],
): ScoringResult {
  if (events.length === 0) {
    const zeroDNA: PersonaDNA = {
      wallet_address,
      aggression: 0,
      conviction: 0,
      chaos: 0,
      luck: 0,
      survival: 0,
      computed_at: Math.floor(Date.now() / 1000),
      event_count: 0,
    };
    return {
      dna: zeroDNA,
      debug: {
        aggression_raw: 0,
        conviction_raw: 0,
        chaos_raw: 0,
        luck_raw: 0,
        survival_raw: 0,
      },
    };
  }

  const aggression = scoreAggression(events);
  const conviction = scoreConviction(events);
  const chaos = scoreChaos(events);
  const luck = scoreLuck(events);
  const survival = scoreSurvival(events);

  const dna: PersonaDNA = {
    wallet_address,
    aggression,
    conviction,
    chaos,
    luck,
    survival,
    computed_at: Math.floor(Date.now() / 1000),
    event_count: events.length,
  };

  return {
    dna,
    debug: {
      aggression_raw: aggression,
      conviction_raw: conviction,
      chaos_raw: chaos,
      luck_raw: luck,
      survival_raw: survival,
    },
  };
}
