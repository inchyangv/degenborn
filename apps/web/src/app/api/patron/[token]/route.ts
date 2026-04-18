/**
 * GET /api/patron/[token]
 *
 * 2.5: Patron Saint — returns the top holder monster for a given Four.meme token.
 *
 * "Patron Saint" = the wallet that holds the most of this token.
 * If holder changes, the Patron Saint changes → drama ensues.
 *
 * Response:
 * {
 *   token_address: string,
 *   patron_wallet: string,
 *   patron_archetype: string,
 *   patron_name: string,       // archetype display name
 *   patron_tagline: string,
 *   hold_amount_usd: number,
 *   is_demo: boolean,
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import { listProfilesAsync } from "@/lib/profile-store";

export const runtime = "nodejs";

// In-memory patron cache: token_address → patron wallet (TTL: 5 min)
const patronCache = new Map<string, { wallet: string; hold_usd: number; at: number }>();
const PATRON_TTL = 5 * 60 * 1000;

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
): Promise<NextResponse> {
  const tokenAddr = params.token.toLowerCase();

  if (!isAddress(tokenAddr)) {
    return NextResponse.json({ error: "invalid token address" }, { status: 400 });
  }

  // Check cache
  const cached = patronCache.get(tokenAddr);
  if (cached && Date.now() - cached.at < PATRON_TTL) {
    return buildResponse(tokenAddr, cached.wallet, cached.hold_usd, false);
  }

  // Find top holder among analyzed wallets
  // In production: query Moralis/BSC API for token holders ranked by balance.
  // For demo: find the profile with highest loyalty score as proxy for "top holder".
  const profiles = await listProfilesAsync(50);

  // Filter profiles that have interacted with this token (heuristic: any profile qualifies in demo)
  // In prod: check event_store for token_address matches.
  // Assign deterministic hold amount from wallet+token hash.
  let topWallet = "";
  let topAmount = 0;

  for (const profile of profiles) {
    // Deterministic pseudo-hold based on wallet + token address (demo only)
    const seed = hashStr(`${profile.wallet_address}:${tokenAddr}`);
    const holdUsd = (seed % 50000) + 1000;
    if (holdUsd > topAmount) {
      topAmount = holdUsd;
      topWallet = profile.wallet_address;
    }
  }

  // If no profiles, use a default demo patron
  if (!topWallet) {
    topWallet = "0x1111111111111111111111111111111111111111";
    topAmount = 42000;
  }

  patronCache.set(tokenAddr, { wallet: topWallet, hold_usd: topAmount, at: Date.now() });
  return buildResponse(tokenAddr, topWallet, topAmount, true);
}

async function buildResponse(
  tokenAddr: string,
  patronWallet: string,
  holdUsd: number,
  isDemo: boolean,
): Promise<NextResponse> {
  const profiles = await listProfilesAsync(100);
  const profile = profiles.find((p) => p.wallet_address.toLowerCase() === patronWallet.toLowerCase());
  const archetype = profile?.archetype ?? "rug_necromancer";
  const archetypeProfile = ARCHETYPE_PROFILES[archetype as keyof typeof ARCHETYPE_PROFILES];

  return NextResponse.json({
    token_address: tokenAddr,
    patron_wallet: patronWallet,
    patron_archetype: archetype,
    patron_name: archetypeProfile?.name ?? archetype,
    patron_tagline: archetypeProfile?.tagline ?? "",
    hold_amount_usd: holdUsd,
    monster_url: `/monster?wallet=${patronWallet}`,
    is_demo: isDemo,
  });
}

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}
