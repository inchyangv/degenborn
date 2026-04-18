/**
 * GET /api/friends?wallet=0x...
 *
 * 3.7: Friend Graph — returns monsters of wallets that frequently traded
 * the same tokens as the given wallet (counterparties / co-holders).
 *
 * In production: query event store for wallets with overlapping token_address.
 * In demo: return all analyzed profiles minus the queried wallet, sorted by
 * DNA similarity (Euclidean distance on 5 axes).
 *
 * Response:
 * {
 *   wallet: string,
 *   friends: Array<{
 *     wallet: string,
 *     archetype: string,
 *     archetype_name: string,
 *     dna_distance: number,    // 0 = identical DNA (twin), 500 = max possible
 *     shared_tokens: number,   // estimated shared token count (demo: deterministic)
 *     monster_url: string,
 *   }>,
 *   is_demo: boolean,
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { ARCHETYPE_PROFILES } from "@degenborn/shared";
import type { PersonaDNA } from "@degenborn/shared";
import { listProfilesAsync, getProfileStore } from "@/lib/profile-store";
import { canonicalizeWallet, isWalletInputSupported } from "@/lib/demo-wallets";

export const runtime = "nodejs";

function dnaDist(a: PersonaDNA, b: PersonaDNA): number {
  return Math.round(Math.sqrt(
    (a.aggression - b.aggression) ** 2 +
    (a.conviction - b.conviction) ** 2 +
    (a.chaos - b.chaos) ** 2 +
    (a.luck - b.luck) ** 2 +
    (a.survival - b.survival) ** 2,
  ));
}

function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const rawWallet = searchParams.get("wallet") ?? "";
  const wallet = canonicalizeWallet(rawWallet) as `0x${string}`;

  if (!isWalletInputSupported(wallet) || !isAddress(wallet)) {
    return NextResponse.json({ error: "invalid wallet address" }, { status: 400 });
  }

  const myProfile = getProfileStore(wallet);
  const allProfiles = await listProfilesAsync(100);

  const others = allProfiles.filter((p) => p.wallet_address.toLowerCase() !== wallet.toLowerCase());

  const myDNA = myProfile?.dna ?? {
    wallet_address: wallet, aggression: 50, conviction: 50, chaos: 50, luck: 50, survival: 50, computed_at: 0, event_count: 0,
  };

  // Compute similarity and shared tokens (demo: deterministic hash)
  const friends = others.map((p) => {
    const dist = dnaDist(myDNA, p.dna);
    const sharedSeed = hashStr(`${wallet}:${p.wallet_address}`);
    const sharedTokens = (sharedSeed % 5) + 1; // 1–5 shared tokens in demo
    return {
      wallet: p.wallet_address,
      archetype: p.archetype,
      archetype_name: ARCHETYPE_PROFILES[p.archetype as keyof typeof ARCHETYPE_PROFILES]?.name ?? p.archetype,
      dna_distance: dist,
      shared_tokens: sharedTokens,
      monster_url: `/monster?wallet=${p.wallet_address}`,
    };
  });

  // Sort by shared tokens desc, then by DNA distance asc
  friends.sort((a, b) => b.shared_tokens - a.shared_tokens || a.dna_distance - b.dna_distance);

  return NextResponse.json({
    wallet,
    friends: friends.slice(0, 20),
    is_demo: others.length === 0 || !myProfile,
  });
}
