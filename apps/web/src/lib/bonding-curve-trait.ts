/**
 * Bonding Curve Stage Trait (TODO 2.2).
 *
 * Determines if a wallet earned Four.meme-specific bonding curve traits:
 *  - early_believer_halo: bought a token when < 30% of curve was filled
 *  - graduate_medal: held a token that completed the curve → DEX graduation
 *
 * In live mode: would query Four.meme API for curve stage at purchase time.
 * In demo mode: deterministically derived from wallet activity patterns.
 */

import type { ActivityEvent } from "@degenborn/shared";

export interface BondingCurveTraits {
  early_believer_halo: boolean;
  graduate_medal: boolean;
  curve_stage_label: string;
}

function hashNum(s: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0;
  }
  return h % mod;
}

/**
 * Derive bonding curve traits from wallet activity.
 *
 * Heuristics:
 * - Early believer: wallet bought many unique tokens (high token diversity = apes early into new launches)
 * - Graduate: wallet has sell events with positive PnL > 200% on a token they held 14+ days
 */
export function deriveBondingCurveTraits(
  walletAddress: string,
  events: ActivityEvent[],
): BondingCurveTraits {
  // Count unique tokens bought
  const buyTokens = new Set(
    events.filter((e) => e.event_type === "buy").map((e) => e.token_address)
  );

  // Count tokens with long hold + positive PnL (proxy for graduation hold)
  let hasGraduateTrade = false;
  const tokenPnl = new Map<string, number>();
  const tokenFirstBuy = new Map<string, number>();

  for (const e of events) {
    if (e.event_type === "buy" && !tokenFirstBuy.has(e.token_address)) {
      tokenFirstBuy.set(e.token_address, e.timestamp);
    }
    if (e.event_type === "sell" && e.pnl_delta > 0) {
      const existing = tokenPnl.get(e.token_address) ?? 0;
      tokenPnl.set(e.token_address, existing + e.pnl_delta);
    }
  }

  for (const [tokenAddr, pnl] of tokenPnl) {
    const firstBuy = tokenFirstBuy.get(tokenAddr);
    if (firstBuy) {
      const lastSell = events
        .filter((e) => e.event_type === "sell" && e.token_address === tokenAddr)
        .reduce((max, e) => Math.max(max, e.timestamp), 0);
      const holdDays = (lastSell - firstBuy) / 86400;
      // Graduate: held 7+ days and made 200%+ on a single token
      if (holdDays >= 7 && pnl > 500) {
        hasGraduateTrade = true;
      }
    }
  }

  // Demo fallback: use wallet hash to deterministically assign traits
  // so demo wallets always have interesting traits
  const hasRealData = events.length > 0;
  let earlyBeliever: boolean;
  let graduate: boolean;

  if (hasRealData) {
    // Early believer: bought 5+ unique tokens (broad aper) OR wallet hash says so
    earlyBeliever = buyTokens.size >= 5 || hashNum(walletAddress, 3) === 0;
    graduate = hasGraduateTrade;
  } else {
    // Pure demo: deterministic
    earlyBeliever = hashNum(walletAddress, 2) === 0;
    graduate = hashNum(walletAddress + "g", 3) === 0;
  }

  const label = graduate
    ? "🎓 Graduated — rode it to the DEX"
    : earlyBeliever
    ? "🌟 Early Believer — ape'd in before the crowd"
    : "📈 Active — bonding curve participant";

  return {
    early_believer_halo: earlyBeliever,
    graduate_medal: graduate,
    curve_stage_label: label,
  };
}
