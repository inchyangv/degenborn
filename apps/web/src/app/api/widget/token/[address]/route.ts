import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getAppUrl } from "@/lib/runtime-env";
import { DEMO_WALLETS } from "@/lib/demo-wallets";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

/**
 * GET /api/widget/token/[address]
 *
 * Returns the top holder monsters for a given Four.meme token contract address.
 * In live mode: would query on-chain holder data from BSC RPC / Four.meme API.
 * In demo mode: deterministically derives top holders from known demo wallets.
 *
 * Schema:
 *   token_address   string  — the queried contract address
 *   token_symbol    string  — token symbol (demo: derived from address suffix)
 *   top_holders     array   — ordered list of monster holders
 *   embed_url       string  — iframe-embeddable HTML page URL
 *   powered_by      string  — "DegenBorn × four.meme"
 */

// Deterministic pseudo-shuffle based on token address
function hashNumber(input: string, mod: number): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
    h = h >>> 0;
  }
  return h % mod;
}

const DEMO_ARCHETYPE_ORDER: ArchetypeId[] = [
  "rug_necromancer",
  "ice_whale",
  "mad_gambler",
  "sniper_jester",
  "diamond_cultist",
  "ghost_bagholder",
];

const DEMO_WALLET_MAP: Record<ArchetypeId, string> = {
  rug_necromancer: DEMO_WALLETS.rug_necromancer,
  ice_whale: DEMO_WALLETS.ice_whale,
  mad_gambler: DEMO_WALLETS.mad_gambler,
  sniper_jester: DEMO_WALLETS.sniper_jester,
  diamond_cultist: DEMO_WALLETS.diamond_cultist,
  ghost_bagholder: DEMO_WALLETS.ghost_bagholder,
};

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } },
): Promise<NextResponse> {
  const { address } = params;
  const addrLower = address.toLowerCase();

  if (!isAddress(addrLower)) {
    return NextResponse.json({ error: "Invalid token contract address" }, { status: 400 });
  }

  const appUrl = getAppUrl();
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") ?? "6", 10), 10);

  // Derive a mock token symbol from the address suffix (demo only)
  const tokenSymbol = `$TOKEN_${addrLower.slice(-4).toUpperCase()}`;

  // Try to use stored profiles first; fall back to demo wallets
  const storedProfiles = await listProfilesAsync(20);
  const source = storedProfiles.length >= 3 ? storedProfiles : null;

  // Deterministically order holders based on token address
  const offset = hashNumber(addrLower, DEMO_ARCHETYPE_ORDER.length);
  const orderedArchetypes = [
    ...DEMO_ARCHETYPE_ORDER.slice(offset),
    ...DEMO_ARCHETYPE_ORDER.slice(0, offset),
  ];

  const topHolders = orderedArchetypes.slice(0, limit).map((archetypeId, rank) => {
    const walletAddr = source
      ? (source[rank % source.length]?.wallet_address ?? DEMO_WALLET_MAP[archetypeId])
      : DEMO_WALLET_MAP[archetypeId];

    // Deterministic hold % based on rank
    const holdPct = Math.round(40 - rank * 5 + hashNumber(addrLower + rank, 8));

    const profile = ARCHETYPE_PROFILES[archetypeId];
    const color = ARCHETYPE_COLORS[archetypeId];

    return {
      rank: rank + 1,
      wallet: walletAddr,
      wallet_short: `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`,
      archetype: archetypeId,
      archetype_name: profile.name,
      archetype_color: color,
      hold_pct: holdPct,
      monster_url: `${appUrl}/m/${walletAddr}`,
      embed_url: `${appUrl}/api/widget/${walletAddr}/embed`,
      image_url: `${appUrl}/api/og/${walletAddr}`,
      is_demo: !source,
    };
  });

  const payload = {
    token_address: addrLower,
    token_symbol: tokenSymbol,
    top_holders: topHolders,
    embed_url: `${appUrl}/api/widget/token/${addrLower}/embed`,
    og_image_url: `${appUrl}/api/og/token/${addrLower}`,
    is_demo: !source,
    powered_by: "DegenBorn × four.meme",
  };

  return NextResponse.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
