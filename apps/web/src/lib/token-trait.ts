/**
 * Token-to-Trait mapping (TODO 2.1).
 *
 * Derives a monster overlay from the wallet's most-held Four.meme token.
 * In demo mode: deterministic from wallet address.
 * In live mode: uses ActivityEvent token_address + token_symbol.
 *
 * The overlay is a purely cosmetic badge/label — not AI-generated,
 * so it updates cheaply without re-rendering the genesis image.
 */

import type { ActivityEvent } from "@degenborn/shared";

export interface TokenOverlay {
  token_address: string;
  token_symbol: string;
  token_emoji: string;
  token_color: string;
  overlay_label: string;
  hold_count: number;
}

// Deterministic color derivation from a hex address
function addressToColor(addr: string): string {
  const clean = addr.replace(/^0x/, "").toLowerCase();
  // Use byte triplets from the middle of the address for RGB
  const r = parseInt(clean.slice(10, 12), 16);
  const g = parseInt(clean.slice(20, 22), 16);
  const b = parseInt(clean.slice(30, 32), 16);
  // Clamp to vivid range (avoid too-dark or too-grey)
  const boost = (v: number) => Math.max(80, Math.min(240, v));
  return `#${boost(r).toString(16).padStart(2, "0")}${boost(g).toString(16).padStart(2, "0")}${boost(b).toString(16).padStart(2, "0")}`;
}

// Map token symbol keywords → emoji
const SYMBOL_EMOJI: [RegExp, string][] = [
  [/pepe/i, "🐸"],
  [/doge|dog/i, "🐶"],
  [/cat|kitty/i, "🐱"],
  [/moon/i, "🌙"],
  [/ape|monkey/i, "🦍"],
  [/shib/i, "🐾"],
  [/bonk/i, "🔨"],
  [/baby/i, "👶"],
  [/ghost/i, "👻"],
  [/skull|dead/i, "💀"],
  [/diamond/i, "💎"],
  [/fire|flame/i, "🔥"],
  [/dragon/i, "🐉"],
  [/snake/i, "🐍"],
  [/fish/i, "🐟"],
  [/bear/i, "🐻"],
  [/bull/i, "🐂"],
];

function symbolToEmoji(symbol: string): string {
  const s = symbol.toUpperCase();
  for (const [re, emoji] of SYMBOL_EMOJI) {
    if (re.test(s)) return emoji;
  }
  return "🎯";
}

// Demo token pool — one per archetype affinity
const DEMO_TOKENS = [
  { address: "0xb17b000000000000000000000000000000000001", symbol: "$BONK" },
  { address: "0xc4f3000000000000000000000000000000000002", symbol: "$PEPE" },
  { address: "0xd06e000000000000000000000000000000000003", symbol: "$DOGE" },
  { address: "0xa4e5000000000000000000000000000000000004", symbol: "$APE" },
  { address: "0xf3d0000000000000000000000000000000000005", symbol: "$MOON" },
  { address: "0xe721000000000000000000000000000000000006", symbol: "$CHAD" },
];

function hashIndex(wallet: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < wallet.length; i++) {
    h = ((h << 5) + h) ^ wallet.charCodeAt(i);
    h = h >>> 0;
  }
  return h % mod;
}

/**
 * Derive the monster's token overlay from activity events.
 * Returns null if no tradeable token was found.
 */
export function deriveTokenOverlay(
  walletAddress: string,
  events: ActivityEvent[],
): TokenOverlay | null {
  // Count how many times each token was traded (buy/sell/hold)
  const tokenCounts = new Map<string, { count: number; symbol: string }>();
  for (const e of events) {
    if (!e.token_address || !["buy", "sell", "hold"].includes(e.event_type)) continue;
    const key = e.token_address.toLowerCase();
    const existing = tokenCounts.get(key);
    tokenCounts.set(key, {
      count: (existing?.count ?? 0) + 1,
      symbol: e.token_symbol ?? existing?.symbol ?? `$${key.slice(-4).toUpperCase()}`,
    });
  }

  let topAddress: string | null = null;
  let topCount = 0;
  let topSymbol = "";

  for (const [addr, { count, symbol }] of tokenCounts) {
    if (count > topCount) {
      topCount = count;
      topAddress = addr;
      topSymbol = symbol;
    }
  }

  // Fall back to deterministic demo token when no real data
  if (!topAddress) {
    const idx = hashIndex(walletAddress, DEMO_TOKENS.length);
    const demo = DEMO_TOKENS[idx]!;
    topAddress = demo.address;
    topSymbol = demo.symbol;
    topCount = 1;
  }

  const color = addressToColor(topAddress);
  const emoji = symbolToEmoji(topSymbol);
  const cleanSymbol = topSymbol.startsWith("$") ? topSymbol : `$${topSymbol}`;

  return {
    token_address: topAddress,
    token_symbol: cleanSymbol,
    token_emoji: emoji,
    token_color: color,
    overlay_label: `${emoji} ${cleanSymbol} holder`,
    hold_count: topCount,
  };
}
